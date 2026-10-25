import { test as base, expect } from '@playwright/test';
import { buildSync } from 'esbuild';
import { readFileSync } from 'node:fs';
export const inspection = JSON.parse(readFileSync(new URL('./inspection.json', import.meta.url), 'utf8'));
const origin = 'http://pwa.synthetic.test';
const bundle = buildSync({
  entryPoints: ['src/lib/sync/queue.ts'], bundle: true, format: 'iife',
  globalName: 'queueAPI', write: false, platform: 'browser',
}).outputFiles[0].text;
// LocalStorage real, contexto nuevo por caso; queue.ts NO se sustituye.
export const test = base.extend({
  sync: async ({ page, context }, use) => {
    const requests = [], records = [], applied = new Map();
    let mode = 'success';
    await context.route(origin + '/', route => route.fulfill({
      contentType: 'text/html', body: '<!doctype html><title>Fixture de integración</title>',
    }));
    await context.route(origin + '/api/inspecciones', async route => {
      const request = route.request(), payload = request.postDataJSON();
      const key = request.headers()['idempotency-key'];
      requests.push({ method: request.method(), key, payload });
      if (mode === 'unavailable') {
        await route.fulfill({ status: 503, json: { error: 'Fallo sintético' } });
        return;
      }
      // No deduplicar por payload.id: ocultaría una regresión del cliente.
      if (!key || !applied.has(key)) {
        records.push(payload);
        if (key) applied.set(key, payload);
      }
      if (mode === 'lost-response') { await route.abort('failed'); return; }
      await route.fulfill({ status: 200, json: { ok: true } });
    });
    await context.addInitScript({ content: bundle + ";window.queueAPI = queueAPI;" });
    await page.goto(origin);
    await use({
      page, context, requests, records,
      setMode: value => { mode = value; },
      enqueue: (payload = inspection, action = 'CREATE') => page.evaluate(
        ({ payload, action }) => window.queueAPI.addToSyncQueue(payload, action), { payload, action }),
      read: () => page.evaluate(() => window.queueAPI.getSyncQueue()),
      process: () => page.evaluate(() => window.queueAPI.processSyncQueue()),
      reload: () => page.reload(),
    });
  },
});
export { expect };
