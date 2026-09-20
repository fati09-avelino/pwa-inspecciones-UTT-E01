import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SW_PATH = path.join(__dirname, "..", "public", "sw.js");

function loadServiceWorker() {
  const source = fs.readFileSync(SW_PATH, "utf-8");
  const listeners = {};
  const cacheStore = new Map();
  const deletedCaches = [];

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
    delete: async (name) => {
      deletedCaches.push(name);
      return cacheStore.delete(name);
    },
    match: async (request) => {
      const key = typeof request === "string" ? request : request.url;
      for (const store of cacheStore.values()) {
        if (store.has(key)) return store.get(key);
      }
      return undefined;
    }
  };

  let networkImpl = async () => {
    throw new Error("fetch de red no configurado en esta prueba");
  };

  const sandbox = {
    caches,
    fetch: (...args) => networkImpl(...args),
    console: { log() {}, warn() {}, error() {} },
    addEventListener(type, handler) {
      listeners[type] = handler;
    },
    skipWaiting() {
      sandbox.__skipWaitingCalled = true;
    },
    clients: {
      claim() {
        sandbox.__clientsClaimCalled = true;
      }
    },
    __skipWaitingCalled: false,
    __clientsClaimCalled: false
  };
  sandbox.self = sandbox;

  vm.runInContext(source, vm.createContext(sandbox), { filename: "public/sw.js" });

  return {
    listeners,
    caches,
    cacheStore,
    deletedCaches,
    sandbox,
    setNetworkImpl: (fn) => {
      networkImpl = fn;
    }
  };
}

function fakeEvent(overrides = {}) {
  const respondCalls = [];
  const waitCalls = [];
  return {
    request: overrides.request,
    waitUntil: (promise) => waitCalls.push(promise),
    respondWith: (promise) => respondCalls.push(promise),
    _respondCalls: respondCalls,
    _waitCalls: waitCalls,
    ...overrides
  };
}

test("install: precachea los recursos críticos del app shell", async () => {
  const sw = loadServiceWorker();
  const evt = fakeEvent();
  sw.listeners.install(evt);
  await Promise.all(evt._waitCalls);

  assert.equal(sw.cacheStore.size, 1);
  const [, store] = [...sw.cacheStore.entries()][0];
  for (const critical of ["/", "/manifest.webmanifest"]) {
    assert.ok(store.has(critical));
  }
  assert.ok(sw.sandbox.__skipWaitingCalled);
});

test("activate: borra únicamente las cachés que no son la versión activa", async () => {
  const sw = loadServiceWorker();
  await sw.caches.open("utt-inspections-v0-vieja");
  const installEvt = fakeEvent();
  sw.listeners.install(installEvt);
  await Promise.all(installEvt._waitCalls);

  const currentCacheName = [...sw.cacheStore.keys()].find((n) => n !== "utt-inspections-v0-vieja");
  const activateEvt = fakeEvent();
  sw.listeners.activate(activateEvt);
  await Promise.all(activateEvt._waitCalls);

  assert.ok(sw.deletedCaches.includes("utt-inspections-v0-vieja"));
  assert.ok(!sw.deletedCaches.includes(currentCacheName));
  assert.ok(sw.sandbox.__clientsClaimCalled);
});

test("fetch: si el recurso ya está en caché, lo devuelve sin llamar a la red", async () => {
  const sw = loadServiceWorker();
  const installEvt = fakeEvent();
  sw.listeners.install(installEvt);
  await Promise.all(installEvt._waitCalls);

  let networkWasCalled = false;
  sw.setNetworkImpl(async () => {
    networkWasCalled = true;
    return { ok: true, from: "red" };
  });

  const evt = fakeEvent({ request: { url: "/manifest.webmanifest", method: "GET", mode: "same-origin" } });
  sw.listeners.fetch(evt);
  const response = await evt._respondCalls[0];
  assert.equal(response.url, "/manifest.webmanifest");
  assert.equal(networkWasCalled, false);
});

test("fetch: si no está en caché, intenta la red y devuelve esa respuesta", async () => {
  const sw = loadServiceWorker();
  sw.setNetworkImpl(async () => ({ ok: true, from: "red" }));
  const evt = fakeEvent({ request: { url: "/dato-no-cacheado.json", method: "GET", mode: "same-origin" } });
  sw.listeners.fetch(evt);
  const response = await evt._respondCalls[0];
  assert.deepEqual(response, { ok: true, from: "red" });
});

test("fetch: las peticiones que no son GET se ignoran (no se intercepta respondWith)", async () => {
  const sw = loadServiceWorker();
  const evt = fakeEvent({ request: { url: "/api/inspecciones", method: "POST", mode: "same-origin" } });
  sw.listeners.fetch(evt);
  assert.equal(evt._respondCalls.length, 0);
});
