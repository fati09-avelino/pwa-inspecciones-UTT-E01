import { test, expect, inspection } from '../fixtures/sync-browser.mjs';
test('guardar offline persiste el payload completo tras recargar sin invocar al remoto', async ({ sync }) => {
  await sync.context.setOffline(true);
  const [operation] = await sync.enqueue();
  expect(await sync.page.evaluate(() => navigator.onLine)).toBe(false);
  expect(await sync.page.evaluate(() => JSON.parse(localStorage.getItem('utt_pwa_sync_queue')))).toEqual([operation]);
  // Documento interceptado: NO prueba el shell offline de la PWA.
  await sync.reload();
  expect(await sync.read()).toEqual([operation]);
  expect((await sync.read())[0].payload).toEqual(inspection);
  expect(sync.requests).toHaveLength(0);
  await sync.context.setOffline(false);
  expect(await sync.process()).toEqual({ processed: 1, failed: 0 });
  expect(await sync.read()).toEqual([]);
  expect(sync.records).toEqual([inspection]);
});
test('respuesta perdida: reintentar la misma operación no duplica el registro remoto', async ({ sync }) => {
  const [operation] = await sync.enqueue();
  sync.setMode('lost-response');
  expect(await sync.process()).toEqual({ processed: 0, failed: 0 });
  expect(sync.records).toEqual([inspection]);
  expect((await sync.read())[0]).toMatchObject({ id: operation.id, retries: 1 });
  await sync.reload();
  sync.setMode('success');
  expect(await sync.process()).toEqual({ processed: 1, failed: 0 });
  expect(sync.records).toHaveLength(1);
  expect(sync.requests).toHaveLength(2);
  expect(sync.requests.map(item => item.key)).toEqual([operation.id, operation.id]);
  expect(sync.records).toEqual([inspection]);
  expect(await sync.read()).toEqual([]);
  expect(await sync.process()).toEqual({ processed: 0, failed: 0 });
  expect(sync.requests).toHaveLength(2);
});
test('HTTP 503 conserva el payload y permite recuperarse después de recargar', async ({ sync }) => {
  const [operation] = await sync.enqueue();
  sync.setMode('unavailable');
  expect(await sync.process()).toEqual({ processed: 0, failed: 0 });
  await sync.reload();
  expect(await sync.read()).toEqual([{ ...operation, retries: 1 }]);
  expect(sync.records).toEqual([]);
  sync.setMode('success');
  expect(await sync.process()).toEqual({ processed: 1, failed: 0 });
  expect(sync.records).toEqual([inspection]);
  expect(await sync.read()).toEqual([]);
});
test('encolar dos veces conserva una operación con el último payload', async ({ sync }) => {
  const [operation] = await sync.enqueue();
  const edited = { ...inspection, findings: 'Hallazgo sintético actualizado', version: 2 };
  await sync.enqueue(edited);
  await sync.reload();
  const queue = await sync.read();
  expect(queue).toHaveLength(1);
  expect(queue[0]).toMatchObject({ id: operation.id, action: 'CREATE', payload: edited });
  expect(await sync.process()).toEqual({ processed: 1, failed: 0 });
  expect(sync.records).toEqual([edited]);
});
test('dos inspecciones conservan identidades y cuerpos HTTP independientes', async ({ sync }) => {
  const other = { ...inspection, id: 'SYNTH-INTEGRATION-009' };
  await sync.enqueue();
  await sync.enqueue(other, 'UPDATE');
  await sync.reload();
  expect(await sync.process()).toEqual({ processed: 2, failed: 0 });
  expect(sync.requests.map(item => item.method)).toEqual(['POST', 'PUT']);
  expect(new Set(sync.requests.map(item => item.key)).size).toBe(2);
  expect(sync.records).toEqual([inspection, other]);
  expect(await sync.read()).toEqual([]);
});
test('cada caso inicia con almacenamiento y remoto aislados', async ({ sync }) => {
  expect(await sync.read()).toEqual([]);
  expect(sync.records).toEqual([]);
  expect(await sync.process()).toEqual({ processed: 0, failed: 0 });
  expect(sync.requests).toEqual([]);
});
