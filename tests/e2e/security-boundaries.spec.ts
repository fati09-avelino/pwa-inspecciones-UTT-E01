import { test, expect } from '@playwright/test';

test('producción entrega cabeceras y CSP bloquea scripts de otro origen', async ({ page }) => {
  const response = await page.goto('/inspecciones');
  expect(response).not.toBeNull();
  expect(response!.headers()['x-content-type-options']).toBe('nosniff');
  expect(response!.headers()['content-security-policy']).toContain("default-src 'self'");
  let externalRequests = 0;
  await page.route('https://synthetic-external.invalid/**', async route => {
    externalRequests++;
    await route.fulfill({ contentType: 'application/javascript', body: 'window.externalRan = true;' });
  });
  const blocked = await page.evaluate(() => new Promise<string>(resolve => {
    document.addEventListener('securitypolicyviolation', event => {
      if (event.blockedURI.startsWith('https://synthetic-external.invalid')) resolve(event.effectiveDirective);
    });
    const script = document.createElement('script');
    script.src = 'https://synthetic-external.invalid/probe.js';
    document.body.append(script);
  }));
  expect(blocked).toBe('script-src-elem');
  expect(externalRequests).toBe(0);
});

test('laboratorio y resumen maliciosos permanecen texto al guardar y recargar', async ({ page }) => {
  await page.goto('/inspecciones');
  const payload = '<img src=x onerror="window.syntheticXss=1">';
  await page.getByLabel('Laboratorio sintético', { exact: true }).fill(payload);
  await page.getByLabel('Resumen de prueba', { exact: true }).fill(payload);
  await page.getByRole('button', { name: 'Guardar inspección', exact: true }).click();
  const capture = page.getByRole('article', { name: /^Inspección SYNTH-/ });
  await expect(capture).toHaveCount(1);
  await expect(capture.getByRole('heading')).toHaveText(payload);
  await page.reload();
  await expect(capture.getByRole('heading')).toHaveText(payload);
  await expect(capture.locator('img')).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, 'syntheticXss'))).toBeUndefined();
});

test('API rechaza entradas inválidas y grandes; consulta no se cachea', async ({ request }) => {
  const id = 'SYNTH-' + crypto.randomUUID();
  const headers = { 'Idempotency-Key': 'security-' + id };
  const invalidJson = await request.post('/api/inspecciones', {
    headers: { ...headers, 'Content-Type': 'application/json' }, data: '{',
  });
  expect(invalidJson.status()).toBe(400);
  const invalid = await request.post('/api/inspecciones', {
    headers, data: { id, laboratory: '', summary: 'Sintético' },
  });
  expect(invalid.status()).toBe(400);
  const oversized = await request.post('/api/inspecciones', {
    headers, data: { id, laboratory: 'Sintético', summary: 'x'.repeat(33000) },
  });
  expect(oversized.status()).toBe(413);
  const response = await request.get('/api/inspecciones');
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toBe('no-store');
  const result = await response.json();
  expect(result.inspections.some((item: { id: string }) => item.id === id)).toBe(false);
});
