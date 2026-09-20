// tests/offline.spec.ts
//
// Pruebas centradas en el comportamiento SIN CONEXIÓN:
// 1. Cuando la red falla durante una navegación, sw.js debe servir un
//    fallback desde caché en lugar de dejar que el error se propague.
// 2. src/lib/pwa/register-service-worker.ts no debe romperse cuando se
//    ejecuta en un entorno sin "window" (p. ej. renderizado en servidor de
//    Next.js), y sí debe registrar el service worker cuando el navegador
//    lo soporta.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SW_PATH = path.join(__dirname, "..", "public", "sw.js");
const REGISTER_PATH = path.join(
  __dirname,
  "..",
  "src",
  "lib",
  "pwa",
  "register-service-worker.ts"
);
// import() exige una URL file:// válida; en Windows una ruta como
// "C:\...\archivo.ts" no es una URL válida, por eso se convierte.
const REGISTER_URL = pathToFileURL(REGISTER_PATH).href;

function loadServiceWorkerForOfflineTest() {
  const source = fs.readFileSync(SW_PATH, "utf-8");
  const cacheStore = new Map();
  const listeners = {};

  function makeCache(name) {
    if (!cacheStore.has(name)) cacheStore.set(name, new Map());
    const store = cacheStore.get(name);
    return {
      addAll: async (urls) => {
        for (const url of urls) store.set(url, { url, body: `stub:${url}` });
      },
      match: async (request) => {
        const key = typeof request === "string" ? request : request.url;
        return store.get(key);
      }
    };
  }

  const caches = {
    open: async (name) => makeCache(name),
    keys: async () => Array.from(cacheStore.keys()),
    delete: async (name) => cacheStore.delete(name),
    match: async (request) => {
      const key = typeof request === "string" ? request : request.url;
      for (const store of cacheStore.values()) {
        if (store.has(key)) return store.get(key);
      }
      return undefined;
    }
  };

  let networkImpl = async () => {
    throw new TypeError("network offline (simulado)");
  };

  const sandbox = {
    caches,
    fetch: (...args) => networkImpl(...args),
    console: { log() {}, warn() {}, error() {} },
    addEventListener(type, handler) {
      listeners[type] = handler;
    },
    skipWaiting() {},
    clients: { claim() {} }
  };
  sandbox.self = sandbox;

  vm.runInContext(source, vm.createContext(sandbox), { filename: "public/sw.js" });

  return { listeners, caches, setNetworkImpl: (fn) => (networkImpl = fn) };
}

function fakeEvent(overrides = {}) {
  const respondCalls = [];
  const waitCalls = [];
  return {
    ...overrides,
    waitUntil: (p) => waitCalls.push(p),
    respondWith: (p) => respondCalls.push(p),
    _respondCalls: respondCalls,
    _waitCalls: waitCalls
  };
}

test("offline: si falla la red durante una navegación, sirve el fallback cacheado en vez de romperse", async () => {
  const sw = loadServiceWorkerForOfflineTest();

  // Precachea el app shell (simula que el usuario ya visitó el sitio con conexión).
  const installEvt = fakeEvent();
  sw.listeners.install(installEvt);
  await Promise.all(installEvt._waitCalls);

  // Simula estar sin conexión: cualquier intento de red falla.
  sw.setNetworkImpl(async () => {
    throw new TypeError("Failed to fetch");
  });

  const navigationEvt = fakeEvent({
    request: { url: "/inspecciones/nueva", method: "GET", mode: "navigate" }
  });
  sw.listeners.fetch(navigationEvt);

  const response = await navigationEvt._respondCalls[0];

  assert.ok(
    response !== undefined,
    "ante un fallo de red en una navegación, debe devolver el fallback offline (no undefined)"
  );
  assert.equal(
    response.url,
    "/",
    "el fallback offline debe ser el app shell cacheado ('/')"
  );
});

test("offline: una petición GET normal (no navegación) que falla en red no inventa una respuesta falsa", async () => {
  const sw = loadServiceWorkerForOfflineTest();
  sw.setNetworkImpl(async () => {
    throw new TypeError("Failed to fetch");
  });

  const evt = fakeEvent({
    request: { url: "/datos/no-cacheados.json", method: "GET", mode: "same-origin" }
  });
  sw.listeners.fetch(evt);

  const response = await evt._respondCalls[0];
  assert.equal(
    response,
    undefined,
    "sin caché, sin red y sin ser navegación, no debe fabricar una respuesta (evita servir datos incorrectos)"
  );
});

test("register-service-worker: no falla en un entorno sin 'window' (renderizado en servidor)", async () => {
  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;
  // @ts-expect-error: simular entorno de servidor sin window
  delete globalThis.window;
  // @ts-expect-error
  delete globalThis.navigator;

  try {
    const mod = await import(`${REGISTER_URL}?bust=${Date.now()}`);
    assert.doesNotThrow(() => mod.registerServiceWorker());
  } finally {
    globalThis.window = originalWindow;
    globalThis.navigator = originalNavigator;
  }
});

test("register-service-worker: registra el service worker cuando el navegador lo soporta", async () => {
  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;

  let registeredWith = null;
  const listeners = {};

  // @ts-expect-error: entorno simulado de navegador
  globalThis.window = {
    addEventListener: (type, handler) => {
      listeners[type] = handler;
    }
  };
  // @ts-expect-error
  globalThis.navigator = {
    serviceWorker: {
      register: async (url) => {
        registeredWith = url;
        return { scope: "/" };
      }
    }
  };

  try {
    const mod = await import(`${REGISTER_URL}?bust=${Date.now()}`);
    mod.registerServiceWorker();

    assert.ok(typeof listeners.load === "function", "debe esperar al evento 'load' antes de registrar");
    await listeners.load();

    assert.equal(registeredWith, "/sw.js", "debe registrar exactamente '/sw.js'");
  } finally {
    globalThis.window = originalWindow;
    globalThis.navigator = originalNavigator;
  }
});
