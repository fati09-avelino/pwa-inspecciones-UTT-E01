// tests/capabilities.spec.ts
//
// Pruebas de COMPORTAMIENTO de la Semana 6 (capacidades del dispositivo y
// notificaciones). Cubre:
//   - src/lib/device/camera.ts
//   - src/lib/device/geolocation.ts
//   - src/lib/notifications/client.ts
//
// Requisitos no funcionales que se verifican (según la actividad):
//   1. Los permisos se piden SOLO por acción del usuario (importar los módulos
//      no pide nada).
//   2. Permisos y datos mínimos (solo video, sin audio; solo 3 campos de
//      ubicación, sin alta precisión; solo imágenes en el fallback de archivo).
//   3. Fallback funcional cuando la API no existe o el permiso se deniega:
//      nunca lanzan excepción y devuelven un valor definido.
//   4. Se libera el recurso (la cámara se apaga al comprobar el permiso).
//
// Las APIs del navegador (navigator, window, Notification, document) no existen
// en Node, así que se simulan SOLO durante cada prueba y se restauran al
// terminar, aunque la prueba falle. No hay red, reloj ni dispositivos reales:
// son deterministas. Los datos son sintéticos.

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fileUrl = (relativePath) => pathToFileURL(path.join(ROOT, relativePath)).href;
const load = (relativePath) => import(fileUrl(relativePath));

const { requestCameraPermission, getFallbackFileInput } = await load("src/lib/device/camera.ts");
const { getCurrentLocation } = await load("src/lib/device/geolocation.ts");
const { isNotificationSupported, requestNotificationPermission, sendLocalNotification } =
  await load("src/lib/notifications/client.ts");

// ---------- Utilidades de simulación ----------

const REMOVE = Symbol("remove");

// Reemplaza (o elimina, con REMOVE) globales durante fn y los restaura SIEMPRE.
// También captura console.warn/info/error para que las pruebas no ensucien la
// salida y para poder comprobar que el fallback deja un aviso visible.
async function withEnv(overrides, fn) {
  const saved = new Map();
  for (const key of Object.keys(overrides)) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    if (overrides[key] === REMOVE) {
      Reflect.deleteProperty(globalThis, key);
    } else {
      Object.defineProperty(globalThis, key, {
        value: overrides[key],
        configurable: true,
        writable: true,
        enumerable: true
      });
    }
  }

  const logs = { warn: [], info: [], error: [] };
  const originalConsole = { warn: console.warn, info: console.info, error: console.error };
  console.warn = (...args) => logs.warn.push(args);
  console.info = (...args) => logs.info.push(args);
  console.error = (...args) => logs.error.push(args);

  try {
    const value = await fn(logs);
    return { value, logs };
  } finally {
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
    console.error = originalConsole.error;
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
}

// Clase Notification simulada: registra construcciones y solicitudes de permiso.
function makeNotification({ permission = "default", requestResult = "granted", requestThrows = false } = {}) {
  const created = [];
  const state = { requests: 0 };
  class FakeNotification {
    constructor(title, options) {
      created.push({ title, options });
    }
    static permission = permission;
    static async requestPermission() {
      state.requests += 1;
      if (requestThrows) throw new Error("fallo simulado al pedir permiso");
      return requestResult;
    }
  }
  return { FakeNotification, created, state };
}

const PAYLOAD = {
  title: "Inspección actualizada",
  body: "INS-001 cambió a En revisión",
  data: { id: "INS-001" }
};

// ---------- 0. Permisos solo por acción del usuario ----------

test("permisos: importar los módulos no pide ningún permiso por sí solo", async () => {
  const calls = { camera: 0, geo: 0, notification: 0 };
  const { FakeNotification } = makeNotification();
  FakeNotification.requestPermission = async () => {
    calls.notification += 1;
    return "granted";
  };

  await withEnv(
    {
      window: { Notification: FakeNotification },
      Notification: FakeNotification,
      navigator: {
        mediaDevices: {
          getUserMedia: async () => {
            calls.camera += 1;
            return { getTracks: () => [] };
          }
        },
        geolocation: {
          getCurrentPosition: () => {
            calls.geo += 1;
          }
        }
      }
    },
    async () => {
      const stamp = `?bust=${Date.now()}`;
      await import(fileUrl("src/lib/device/camera.ts") + stamp);
      await import(fileUrl("src/lib/device/geolocation.ts") + stamp);
      await import(fileUrl("src/lib/notifications/client.ts") + stamp);
    }
  );

  assert.deepEqual(calls, { camera: 0, geo: 0, notification: 0 });
});

// ---------- 1. Cámara ----------

test("cámara: con permiso concedido devuelve true y apaga todas las pistas de video", async () => {
  const stopped = [];
  const stream = {
    getTracks: () => [{ stop: () => stopped.push("a") }, { stop: () => stopped.push("b") }]
  };

  const { value } = await withEnv(
    { navigator: { mediaDevices: { getUserMedia: async () => stream } } },
    () => requestCameraPermission()
  );

  assert.equal(value, true);
  assert.equal(stopped.length, 2, "no debe dejar la cámara encendida después de comprobar el permiso");
});

test("cámara: pide solo video (permiso mínimo, sin micrófono)", async () => {
  let received;
  await withEnv(
    {
      navigator: {
        mediaDevices: {
          getUserMedia: async (constraints) => {
            received = constraints;
            return { getTracks: () => [] };
          }
        }
      }
    },
    () => requestCameraPermission()
  );

  assert.deepEqual(received, { video: true });
});

test("cámara: si el usuario deniega el permiso devuelve false sin lanzar y deja un aviso", async () => {
  const { value, logs } = await withEnv(
    {
      navigator: {
        mediaDevices: {
          getUserMedia: async () => {
            throw new Error("NotAllowedError");
          }
        }
      }
    },
    () => requestCameraPermission()
  );

  assert.equal(value, false);
  assert.equal(logs.warn.length, 1, "el fallo debe quedar registrado, no silenciarse del todo");
});

test("cámara: si el navegador no tiene mediaDevices devuelve false", async () => {
  const { value } = await withEnv({ navigator: {} }, () => requestCameraPermission());
  assert.equal(value, false);
});

test("cámara: si mediaDevices existe pero sin getUserMedia devuelve false", async () => {
  const { value } = await withEnv({ navigator: { mediaDevices: {} } }, () => requestCameraPermission());
  assert.equal(value, false);
});

test("cámara: el fallback de archivo solo acepta imágenes y sugiere la cámara trasera", async () => {
  let createdTag = null;
  const { value: input } = await withEnv(
    {
      document: {
        createElement: (tag) => {
          createdTag = tag;
          return {};
        }
      }
    },
    () => getFallbackFileInput()
  );

  assert.equal(createdTag, "input");
  assert.equal(input.type, "file");
  assert.equal(input.accept, "image/*", "limita lo que se puede adjuntar a imágenes");
  assert.equal(input.capture, "environment");
});

// ---------- 2. Geolocalización ----------

test("geolocalización: si el navegador no la soporta devuelve null", async () => {
  const { value } = await withEnv({ navigator: {} }, () => getCurrentLocation());
  assert.equal(value, null);
});

test("geolocalización: devuelve solo latitud, longitud y precisión (minimización de datos)", async () => {
  const geolocation = {
    getCurrentPosition: (onSuccess) =>
      onSuccess({
        coords: {
          latitude: 18.4618,
          longitude: -97.3927,
          accuracy: 35,
          altitude: 1650,
          speed: 2.5,
          heading: 90
        },
        timestamp: 1700000000000
      })
  };

  const { value } = await withEnv({ navigator: { geolocation } }, () => getCurrentLocation());

  assert.deepEqual(value, { latitude: 18.4618, longitude: -97.3927, accuracy: 35 });
  assert.deepEqual(Object.keys(value).sort(), ["accuracy", "latitude", "longitude"]);
});

test("geolocalización: si el usuario deniega el permiso devuelve null sin lanzar", async () => {
  const geolocation = {
    getCurrentPosition: (_onSuccess, onError) => onError({ code: 1, message: "User denied Geolocation" })
  };

  const { value, logs } = await withEnv({ navigator: { geolocation } }, () => getCurrentLocation());

  assert.equal(value, null);
  assert.equal(logs.warn.length, 1);
});

test("geolocalización: usa baja precisión y una espera acotada (permiso y batería mínimos)", async () => {
  let receivedOptions;
  const geolocation = {
    getCurrentPosition: (_onSuccess, onError, options) => {
      receivedOptions = options;
      onError({ code: 3, message: "timeout" });
    }
  };

  await withEnv({ navigator: { geolocation } }, () => getCurrentLocation());

  assert.equal(receivedOptions.enableHighAccuracy, false);
  assert.ok(Number.isFinite(receivedOptions.timeout) && receivedOptions.timeout > 0, "debe tener un tiempo límite");
  assert.ok(Number.isFinite(receivedOptions.maximumAge) && receivedOptions.maximumAge >= 0);
});

// ---------- 3. Notificaciones: soporte y permiso ----------

test("notificaciones: isNotificationSupported es false sin window", async () => {
  const { value } = await withEnv({ window: REMOVE }, () => isNotificationSupported());
  assert.equal(value, false);
});

test("notificaciones: isNotificationSupported es false si window no tiene Notification", async () => {
  const { value } = await withEnv({ window: {} }, () => isNotificationSupported());
  assert.equal(value, false);
});

test("notificaciones: isNotificationSupported es true cuando existe Notification", async () => {
  const { FakeNotification } = makeNotification();
  const { value } = await withEnv({ window: { Notification: FakeNotification } }, () => isNotificationSupported());
  assert.equal(value, true);
});

test("notificaciones: sin soporte, pedir permiso devuelve 'denied' sin lanzar", async () => {
  const { value } = await withEnv({ window: {} }, () => requestNotificationPermission());
  assert.equal(value, "denied");
});

test("notificaciones: devuelve el estado real que elige el usuario (granted y default)", async () => {
  for (const answer of ["granted", "default"]) {
    const { FakeNotification, state } = makeNotification({ requestResult: answer });
    const { value } = await withEnv(
      { window: { Notification: FakeNotification }, Notification: FakeNotification },
      () => requestNotificationPermission()
    );
    assert.equal(value, answer);
    assert.equal(state.requests, 1);
  }
});

test("notificaciones: si requestPermission falla, devuelve 'denied' en vez de lanzar", async () => {
  const { FakeNotification } = makeNotification({ requestThrows: true });
  const { value, logs } = await withEnv(
    { window: { Notification: FakeNotification }, Notification: FakeNotification },
    () => requestNotificationPermission()
  );

  assert.equal(value, "denied");
  assert.equal(logs.warn.length, 1);
});

// ---------- 4. Notificaciones: envío y fallbacks ----------

test("envío: sin soporte devuelve false y deja el aviso de fallback visible", async () => {
  const { value, logs } = await withEnv({ window: {} }, () => sendLocalNotification(PAYLOAD));

  assert.equal(value, false);
  assert.equal(logs.info.length, 1);
  assert.ok(logs.info[0].join(" ").includes(PAYLOAD.title), "el fallback debe mostrar el contenido del aviso");
});

test("envío: con permiso denegado no muestra nada ni vuelve a pedir permiso", async () => {
  const { FakeNotification, created, state } = makeNotification({ permission: "denied" });
  const shown = [];
  const registration = { showNotification: async (...args) => shown.push(args) };

  const { value } = await withEnv(
    {
      window: { Notification: FakeNotification },
      Notification: FakeNotification,
      navigator: { serviceWorker: { ready: Promise.resolve(registration) } }
    },
    () => sendLocalNotification(PAYLOAD)
  );

  assert.equal(value, false);
  assert.equal(created.length, 0);
  assert.equal(shown.length, 0);
  assert.equal(state.requests, 0, "no debe volver a molestar al usuario con otro cuadro de permiso");
});

test("envío: con permiso aún no decidido ('default') no pide permiso por su cuenta", async () => {
  const { FakeNotification, created, state } = makeNotification({ permission: "default" });

  const { value } = await withEnv(
    { window: { Notification: FakeNotification }, Notification: FakeNotification, navigator: {} },
    () => sendLocalNotification(PAYLOAD)
  );

  assert.equal(value, false);
  assert.equal(created.length, 0);
  assert.equal(state.requests, 0, "el permiso solo se solicita desde requestNotificationPermission (acción del usuario)");
});

test("envío: con permiso concedido y Service Worker activo, usa showNotification con título, cuerpo y datos", async () => {
  const { FakeNotification, created } = makeNotification({ permission: "granted" });
  const shown = [];
  const registration = { showNotification: async (title, options) => shown.push({ title, options }) };

  const { value } = await withEnv(
    {
      window: { Notification: FakeNotification },
      Notification: FakeNotification,
      navigator: { serviceWorker: { ready: Promise.resolve(registration) } }
    },
    () => sendLocalNotification(PAYLOAD)
  );

  assert.equal(value, true);
  assert.equal(shown.length, 1);
  assert.equal(shown[0].title, PAYLOAD.title);
  assert.equal(shown[0].options.body, PAYLOAD.body);
  assert.deepEqual(shown[0].options.data, PAYLOAD.data);
  assert.equal(created.length, 0, "si el Service Worker la mostró, no debe duplicarla con otra Notification");
});

test("envío: usa el icono por defecto y respeta uno personalizado", async () => {
  const { FakeNotification } = makeNotification({ permission: "granted" });
  const shown = [];
  const registration = { showNotification: async (title, options) => shown.push(options) };
  const env = {
    window: { Notification: FakeNotification },
    Notification: FakeNotification,
    navigator: { serviceWorker: { ready: Promise.resolve(registration) } }
  };

  await withEnv(env, () => sendLocalNotification(PAYLOAD));
  await withEnv(env, () => sendLocalNotification({ ...PAYLOAD, icon: "/icons/otro.png" }));

  assert.equal(shown[0].icon, "/icons/icon-192x192.png");
  assert.equal(shown[1].icon, "/icons/otro.png");
});

test("envío: sin Service Worker, con permiso concedido, usa la API Notification del hilo principal", async () => {
  const { FakeNotification, created } = makeNotification({ permission: "granted" });

  const { value } = await withEnv(
    { window: { Notification: FakeNotification }, Notification: FakeNotification, navigator: {} },
    () => sendLocalNotification(PAYLOAD)
  );

  assert.equal(value, true);
  assert.equal(created.length, 1);
  assert.equal(created[0].title, PAYLOAD.title);
  assert.equal(created[0].options.body, PAYLOAD.body);
});

test("envío: si el registro del Service Worker no puede mostrar notificaciones, cae a Notification", async () => {
  const { FakeNotification, created } = makeNotification({ permission: "granted" });

  const { value } = await withEnv(
    {
      window: { Notification: FakeNotification },
      Notification: FakeNotification,
      navigator: { serviceWorker: { ready: Promise.resolve({}) } }
    },
    () => sendLocalNotification(PAYLOAD)
  );

  assert.equal(value, true);
  assert.equal(created.length, 1);
});

test("envío: si showNotification falla, no lanza error y devuelve false", async () => {
  const { FakeNotification } = makeNotification({ permission: "granted" });
  const registration = {
    showNotification: async () => {
      throw new Error("fallo simulado del Service Worker");
    }
  };

  const { value, logs } = await withEnv(
    {
      window: { Notification: FakeNotification },
      Notification: FakeNotification,
      navigator: { serviceWorker: { ready: Promise.resolve(registration) } }
    },
    () => sendLocalNotification(PAYLOAD)
  );

  assert.equal(value, false);
  assert.ok(logs.warn.length >= 1, "el fallo debe quedar registrado");
});

// ---------- 5. Flujo útil sin ninguna capacidad ----------

test("sin ninguna capacidad disponible, la app sigue funcionando: nada lanza y cada módulo ofrece su fallback", async () => {
  const { value } = await withEnv(
    {
      navigator: {},
      window: {},
      document: { createElement: () => ({}) }
    },
    async () => ({
      camera: await requestCameraPermission(),
      fileInput: getFallbackFileInput(),
      location: await getCurrentLocation(),
      permission: await requestNotificationPermission(),
      sent: await sendLocalNotification(PAYLOAD)
    })
  );

  assert.equal(value.camera, false);
  assert.equal(value.fileInput.type, "file", "al no haber cámara, el usuario aún puede adjuntar evidencia por archivo");
  assert.equal(value.location, null);
  assert.equal(value.permission, "denied");
  assert.equal(value.sent, false);
});
