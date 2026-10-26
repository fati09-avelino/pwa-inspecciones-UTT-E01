import { test, expect } from '@playwright/test';

test('crear offline, recargar realmente sin red y sincronizar una sola inspección', async ({ page, context, request }) => {
  const laboratory = 'Laboratorio sintético ' + crypto.randomUUID();
  await page.goto('/inspecciones');
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>(resolve => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
    }
    if (registration.installing) throw new Error('Service Worker todavía instalando');
  });
  await context.setOffline(true);
  await page.getByLabel('Laboratorio sintético').fill(laboratory);
  await page.getByLabel('Resumen de prueba').fill('Hallazgo sintético guardado sin red');
  await page.getByRole('button', { name: 'Guardar inspección', exact: true }).click();
  let record = page.getByRole('article').filter({ hasText: laboratory });
  await expect(record).toHaveCount(1);
  await expect(record).toContainText('Pendiente de sincronizar');
  const id = await record.locator('small').innerText();

  await page.reload();
  record = page.getByRole('article').filter({ hasText: laboratory });
  await expect(record).toHaveCount(1);
  await expect(record).toContainText('Hallazgo sintético guardado sin red');
  await expect(page.getByText('Sin conexión', { exact: true })).toBeVisible();

  await context.setOffline(false);
  await page.getByRole('button', { name: 'Sincronizar pendientes', exact: true }).click();
  await expect(record).toContainText('Sincronizada');
  await page.getByRole('button', { name: 'Sincronizar pendientes', exact: true }).click();
  const response = await request.get('/api/inspecciones');
  expect(response.ok()).toBe(true);
  const data = await response.json();
  expect(data.inspections.filter((item: { id: string }) => item.id === id)).toHaveLength(1);
  await page.reload();
  await expect(page.getByRole('article').filter({ hasText: laboratory })).toContainText('Sincronizada');
});

test('una captura se guarda aunque se denieguen cámara y ubicación', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: {
      getUserMedia: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')),
    } });
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
      getCurrentPosition: (_ok: unknown, fail: (error: unknown) => void) => fail({ code: 1 }),
    } });
  });
  await page.goto('/inspecciones');
  await page.getByRole('button', { name: /Registrar Ubicación/ }).click();
  await expect(page.getByText(/Puedes continuar sin ella/)).toBeVisible();
  await page.getByRole('button', { name: /Adjuntar Foto/ }).click();
  await expect(page.getByText(/Cámara no disponible o permiso denegado/)).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'sintetica.png', mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
  });
  await expect(page.getByText('Evidencia lista: sintetica.png')).toBeVisible();
  const laboratory = 'Captura sintética sin permisos ' + crypto.randomUUID();
  await page.getByLabel('Laboratorio sintético').fill(laboratory);
  await page.getByLabel('Resumen de prueba').fill('Captura completada usando fallbacks');
  await page.getByRole('button', { name: 'Guardar inspección', exact: true }).click();
  await expect(page.getByRole('article').filter({ hasText: laboratory })).toContainText('Pendiente de sincronizar');
});
