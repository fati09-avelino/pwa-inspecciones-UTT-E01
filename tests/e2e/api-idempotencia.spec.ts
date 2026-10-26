import { test, expect } from '@playwright/test';

test('el endpoint real aplica una misma operación una sola vez y rechaza cambiar su contenido', async ({ request }) => {
  const id = 'SYNTH-' + crypto.randomUUID();
  const body = {
    id, laboratory: 'Laboratorio sintético API', summary: 'Reintento sintético',
    updatedAt: '2026-10-25T12:00:00.000Z',
  };
  const headers = { 'Idempotency-Key': 'queue-' + id };
  const first = await request.post('/api/inspecciones', { data: body, headers });
  const retry = await request.post('/api/inspecciones', { data: body, headers });
  expect(first.status()).toBe(200);
  expect(retry.status()).toBe(200);
  expect(await retry.json()).toEqual(await first.json());
  const conflict = await request.post('/api/inspecciones', {
    data: { ...body, summary: 'Contenido distinto' }, headers,
  });
  expect(conflict.status()).toBe(409);
  const response = await request.get('/api/inspecciones');
  const result = await response.json();
  expect(result.inspections.filter((item: { id: string }) => item.id === id)).toHaveLength(1);
});
