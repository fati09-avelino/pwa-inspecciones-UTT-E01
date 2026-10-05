// tests/sync.spec.ts
//
// Pruebas de comportamiento para la Semana 5 (persistencia local y
// sincronización idempotente). Cubre:
//   - src/lib/sync/conflict-policy.ts (resolveConflict, isDuplicateInQueue)
//   - src/lib/sync/queue.ts (getSyncQueue, saveSyncQueue, addToSyncQueue,
//     processSyncQueue, clearSyncQueue)
//
// queue.ts usa `localStorage`/`window` del navegador. Como las pruebas
// corren en Node (sin navegador), se simula un `localStorage` mínimo en
// memoria y se asigna a `globalThis.window`/`globalThis.localStorage` solo
// durante las pruebas que lo necesitan; se restaura el estado original
// después de cada una para no afectar a las demás pruebas del archivo.

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = (relativePath) => import(pathToFileURL(path.join(ROOT, relativePath)).href);

const { resolveConflict, isDuplicateInQueue } = await load("src/lib/sync/conflict-policy.ts");
const { getSyncQueue, saveSyncQueue, addToSyncQueue, processSyncQueue, clearSyncQueue } =
  await load("src/lib/sync/queue.ts");

// ---------- Datos sintéticos de apoyo ----------

function makeInspection(overrides = {}) {
  return {
    id: "INS-001",
    title: "Revisión de red",
    status: "Pendiente",
    statusLabel: "Pendiente",
    location: "Edificio A",
    summary: "Revisión general",
    findings: "Sin hallazgos",
    updatedAt: "2026-10-01T10:00:00.000Z",
    version: 1,
    ...overrides
  };
}

// ---------- localStorage simulado (solo para las pruebas de queue.ts) ----------

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
}

// Ejecuta fn con window/localStorage simulados y SIEMPRE restaura el estado
// global original al terminar (incluso si fn lanza), para no filtrar estado
// de una prueba a otra.
async function withBrowserEnv(fn) {
  const hadWindow = "window" in globalThis;
  const hadStorage = "localStorage" in globalThis;
  const prevWindow = globalThis.window;
  const prevStorage = globalThis.localStorage;

  const storage = createMemoryStorage();
  globalThis.window = {};
  globalThis.localStorage = storage;

  try {
    return await fn(storage);
  } finally {
    if (hadWindow) globalThis.window = prevWindow;
    else delete globalThis.window;
    if (hadStorage) globalThis.localStorage = prevStorage;
    else delete globalThis.localStorage;
  }
}

// ---------- resolveConflict: quién gana ----------

test("resolveConflict: si la versión local es más reciente, gana el local y sube de versión", () => {
  const server = makeInspection({ updatedAt: "2026-10-01T10:00:00.000Z", version: 3 });
  const local = makeInspection({
    updatedAt: "2026-10-01T12:00:00.000Z",
    findings: "Hallazgo nuevo capturado offline",
    version: 1
  });

  const result = resolveConflict(local, server);

  assert.equal(result.findings, "Hallazgo nuevo capturado offline");
  assert.equal(result.version, server.version + 1, "debe avanzar desde la versión del servidor");
});

test("resolveConflict: si la versión del servidor es más reciente, gana el servidor tal cual", () => {
  const server = makeInspection({
    updatedAt: "2026-10-02T09:00:00.000Z",
    findings: "Actualizado por otro inspector en el servidor",
    version: 5
  });
  const local = makeInspection({ updatedAt: "2026-10-01T10:00:00.000Z", version: 1 });

  assert.deepEqual(resolveConflict(local, server), server);
});

test("resolveConflict: en caso de empate exacto de tiempo, gana el servidor (desempate consistente)", () => {
  const sameTime = "2026-10-01T10:00:00.000Z";
  const server = makeInspection({ updatedAt: sameTime, version: 2, findings: "Servidor" });
  const local = makeInspection({ updatedAt: sameTime, version: 2, findings: "Local" });

  assert.equal(resolveConflict(local, server).findings, "Servidor");
});

test("resolveConflict: no muta los objetos originales que recibe", () => {
  const server = makeInspection({ updatedAt: "2026-10-01T10:00:00.000Z", version: 1 });
  const local = makeInspection({ updatedAt: "2026-10-02T10:00:00.000Z", version: 1 });
  const serverSnapshot = { ...server };
  const localSnapshot = { ...local };

  resolveConflict(local, server);

  assert.deepEqual(server, serverSnapshot);
  assert.deepEqual(local, localSnapshot);
});

// ---------- isDuplicateInQueue ----------

test("isDuplicateInQueue: detecta un id ya presente en la cola", () => {
  const queue = [makeInspection({ id: "INS-001" }), makeInspection({ id: "INS-002" })];
  assert.equal(isDuplicateInQueue(queue, makeInspection({ id: "INS-001" })), true);
});

test("isDuplicateInQueue: un id nuevo no se marca como duplicado", () => {
  const queue = [makeInspection({ id: "INS-001" })];
  assert.equal(isDuplicateInQueue(queue, makeInspection({ id: "INS-003" })), false);
});

test("isDuplicateInQueue: una cola vacía nunca tiene duplicados", () => {
  assert.equal(isDuplicateInQueue([], makeInspection()), false);
});

// ---------- queue.ts: entorno de servidor (sin window) ----------

test("queue en SSR: getSyncQueue/saveSyncQueue/clearSyncQueue no lanzan error sin 'window'", () => {
  assert.equal("window" in globalThis, false, "esta prueba asume que no hay window simulado todavía");
  assert.deepEqual(getSyncQueue(), []);
  assert.doesNotThrow(() => saveSyncQueue([makeInspection()]));
  assert.doesNotThrow(() => clearSyncQueue());
});

test("queue en SSR: addToSyncQueue no lanza error y no persiste nada real", () => {
  const result = addToSyncQueue(makeInspection({ id: "INS-SSR" }));
  assert.equal(result.length, 1, "debe devolver el item en memoria aunque no haya window");
  // como saveSyncQueue no hace nada sin window, una llamada nueva no "recuerda" la anterior
  const again = addToSyncQueue(makeInspection({ id: "INS-SSR-2" }));
  assert.equal(again.length, 1, "sin persistencia real, cada llamada parte de una cola vacía");
});

// ---------- queue.ts: getSyncQueue / saveSyncQueue ----------

test("getSyncQueue: en storage vacío devuelve un arreglo vacío", async () => {
  await withBrowserEnv(() => {
    assert.deepEqual(getSyncQueue(), []);
  });
});

test("saveSyncQueue + getSyncQueue: hacen un roundtrip correcto", async () => {
  await withBrowserEnv(() => {
    const items = [{ id: "q1", action: "CREATE", endpoint: "/api/inspecciones", payload: makeInspection(), timestamp: 1, retries: 0 }];
    saveSyncQueue(items);
    assert.deepEqual(getSyncQueue(), items);
  });
});

test("getSyncQueue: si el storage tiene JSON corrupto, no lanza error y devuelve vacío", async () => {
  await withBrowserEnv((storage) => {
    storage.setItem("utt_pwa_sync_queue", "{esto no es json válido");
    assert.deepEqual(getSyncQueue(), []);
  });
});

// ---------- queue.ts: addToSyncQueue ----------

test("addToSyncQueue: agrega un item nuevo con retries en 0", async () => {
  await withBrowserEnv(() => {
    const queue = addToSyncQueue(makeInspection({ id: "INS-010" }), "CREATE", "/api/inspecciones");
    assert.equal(queue.length, 1);
    assert.equal(queue[0].action, "CREATE");
    assert.equal(queue[0].retries, 0);
    assert.equal(queue[0].payload.id, "INS-010");
  });
});

test("addToSyncQueue: el mismo id dos veces NO duplica la fila, actualiza el payload existente", async () => {
  await withBrowserEnv(() => {
    addToSyncQueue(makeInspection({ id: "INS-011", findings: "Primer hallazgo" }));
    const queue = addToSyncQueue(makeInspection({ id: "INS-011", findings: "Hallazgo corregido" }));

    assert.equal(queue.length, 1, "no debe crear una segunda fila para el mismo id de inspección");
    assert.equal(queue[0].payload.findings, "Hallazgo corregido", "debe quedarse con el payload más reciente");
  });
});

test("addToSyncQueue: distintos ids sí generan filas separadas en la cola", async () => {
  await withBrowserEnv(() => {
    addToSyncQueue(makeInspection({ id: "INS-020" }));
    addToSyncQueue(makeInspection({ id: "INS-021" }));
    const queue = getSyncQueue();

    assert.equal(queue.length, 2);
    assert.deepEqual(
      queue.map((i) => i.payload.id).sort(),
      ["INS-020", "INS-021"]
    );
  });
});

test("addToSyncQueue: persiste de verdad (otra lectura ve lo agregado)", async () => {
  await withBrowserEnv(() => {
    addToSyncQueue(makeInspection({ id: "INS-030" }));
    assert.equal(getSyncQueue().length, 1, "una lectura posterior debe ver el item guardado");
  });
});

// ---------- queue.ts: processSyncQueue ----------

test("processSyncQueue: con la cola vacía, no hace nada y no llama a sendFunction", async () => {
  await withBrowserEnv(async () => {
    let called = false;
    const result = await processSyncQueue(async () => {
      called = true;
      return true;
    });
    assert.deepEqual(result, { processed: 0, failed: 0 });
    assert.equal(called, false);
  });
});

test("processSyncQueue: un envío exitoso cuenta como procesado y saca el item de la cola persistida", async () => {
  await withBrowserEnv(async () => {
    addToSyncQueue(makeInspection({ id: "INS-040" }));
    const result = await processSyncQueue(async () => true);

    assert.deepEqual(result, { processed: 1, failed: 0 });
    assert.deepEqual(getSyncQueue(), [], "tras un envío exitoso, la cola persistida debe quedar vacía");
  });
});

test("processSyncQueue: un envío fallido por debajo del límite queda en la cola con un reintento más", async () => {
  await withBrowserEnv(async () => {
    addToSyncQueue(makeInspection({ id: "INS-050" }));
    const result = await processSyncQueue(async () => false);

    assert.deepEqual(result, { processed: 0, failed: 0 }, "todavía no se descarta: no superó el máximo de reintentos");
    const remaining = getSyncQueue();
    assert.equal(remaining.length, 1, "el item debe seguir en la cola para reintentarlo después");
    assert.equal(remaining[0].retries, 1);
  });
});

test("processSyncQueue: al superar el máximo de reintentos, el item se descarta y cuenta como fallido", async () => {
  await withBrowserEnv(async () => {
    // Se coloca directamente con retries = 2 (MAX_RETRIES = 3): el próximo fallo lo saca.
    saveSyncQueue([
      { id: "q-max", action: "UPDATE", endpoint: "/api/inspecciones", payload: makeInspection({ id: "INS-060" }), timestamp: Date.now(), retries: 2 }
    ]);

    const result = await processSyncQueue(async () => false);

    assert.deepEqual(result, { processed: 0, failed: 1 });
    assert.deepEqual(getSyncQueue(), [], "un item que agota sus reintentos no debe quedar atascado en la cola para siempre");
  });
});

test("processSyncQueue: si sendFunction rechaza (lanza), se trata como fallo, no revienta el proceso", async () => {
  await withBrowserEnv(async () => {
    addToSyncQueue(makeInspection({ id: "INS-070" }));

    await assert.doesNotReject(async () => {
      const result = await processSyncQueue(async () => {
        throw new Error("Fallo de red simulado");
      });
      assert.deepEqual(result, { processed: 0, failed: 0 });
    });

    assert.equal(getSyncQueue()[0].retries, 1, "un envío que lanza también debe contar como reintento");
  });
});

test("processSyncQueue: procesa una cola mixta con el conteo correcto de éxitos y fallos", async () => {
  await withBrowserEnv(async () => {
    addToSyncQueue(makeInspection({ id: "INS-OK" }));
    addToSyncQueue(makeInspection({ id: "INS-FAIL" }));

    const result = await processSyncQueue(async (item) => item.payload.id === "INS-OK");

    assert.deepEqual(result, { processed: 1, failed: 0 });
    const remaining = getSyncQueue();
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].payload.id, "INS-FAIL");
    assert.equal(remaining[0].retries, 1);
  });
});

test("processSyncQueue: sin sendFunction, un endpoint inválido falla de forma controlada (no revienta)", async () => {
  await withBrowserEnv(async () => {
    addToSyncQueue(makeInspection({ id: "INS-080" }), "UPDATE", "/api/inspecciones");

    await assert.doesNotReject(async () => {
      const result = await processSyncQueue(); // usa fetch real contra una URL relativa, sin servidor
      assert.equal(result.processed, 0);
    });
  });
});

// ---------- Integración: addToSyncQueue + isDuplicateInQueue ----------

test("integración: los payloads ya encolados se detectan como duplicados con isDuplicateInQueue", async () => {
  await withBrowserEnv(() => {
    addToSyncQueue(makeInspection({ id: "INS-090" }));
    const payloads = getSyncQueue().map((item) => item.payload);

    assert.equal(isDuplicateInQueue(payloads, makeInspection({ id: "INS-090" })), true);
    assert.equal(isDuplicateInQueue(payloads, makeInspection({ id: "INS-091" })), false);
  });
});
