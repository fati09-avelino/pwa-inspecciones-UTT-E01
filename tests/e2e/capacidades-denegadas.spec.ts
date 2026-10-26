import { test, expect } from '@playwright/test';

// PNG sintético de 1x1 píxel: no hay datos reales ni PII.
const PNG_SINTETICO = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

test.describe('Capacidades denegadas: la captura se completa con los fallbacks', () => {
  test.beforeEach(async ({ page }) => {
    // Simula que la persona NIEGA el permiso de cámara y de ubicación.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: {
          getUserMedia: () =>
            Promise.reject(new DOMException('Permission denied', 'NotAllowedError')),
        },
      });
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: {
          getCurrentPosition: (_ok: unknown, fail: (e: unknown) => void) =>
            fail({ code: 1, message: 'User denied Geolocation' }),
        },
      });
    });
  });

  test('cámara denegada: aparece el aviso y se puede adjuntar la imagen desde archivos', async ({ page }) => {
    const dialogos: string[] = [];
    page.on('dialog', async (d) => {
      dialogos.push(d.message());
      await d.dismiss();
    });

    await page.goto('/inspecciones');

    await page.getByRole('button', { name: /Adjuntar Foto/ }).click();

    // Fallback visible: el aviso de que la cámara no está disponible.
    await expect(page.getByText(/Cámara no disponible o permiso denegado/)).toBeVisible();

    // La captura se completa con el selector de archivo (fallback).
    await page.locator('input[type="file"]').setInputFiles({
      name: 'evidencia-sintetica.png',
      mimeType: 'image/png',
      buffer: PNG_SINTETICO,
    });
    await expect(page.getByText('Evidencia lista: evidencia-sintetica.png')).toBeVisible();

    // La app no se rompe ni muestra alert().
    expect(dialogos).toEqual([]);
  });

  test('ubicación denegada: aparece el aviso y la app sigue utilizable', async ({ page }) => {
    const dialogos: string[] = [];
    page.on('dialog', async (d) => {
      dialogos.push(d.message());
      await d.dismiss();
    });

    await page.goto('/inspecciones');

    await page.getByRole('button', { name: /Registrar Ubicación/ }).click();

    await expect(page.getByText(/No se pudo obtener la ubicación/)).toBeVisible();
    await expect(page.getByText(/Puedes continuar sin ella/)).toBeVisible();

    // Sigue pudiendo usar el resto de las acciones.
    await expect(page.getByRole('button', { name: /Adjuntar Foto/ })).toBeEnabled();
    await expect(page.getByRole('button', { name: /Registrar Ubicación/ })).toBeEnabled();
    expect(dialogos).toEqual([]);
  });

  test('cámara y ubicación denegadas a la vez: ambos fallbacks conviven y la captura termina', async ({ page }) => {
    await page.goto('/inspecciones');

    await page.getByRole('button', { name: /Registrar Ubicación/ }).click();
    await expect(page.getByText(/No se pudo obtener la ubicación/)).toBeVisible();

    await page.getByRole('button', { name: /Adjuntar Foto/ }).click();
    await expect(page.getByText(/Cámara no disponible o permiso denegado/)).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles({
      name: 'evidencia-sintetica.png',
      mimeType: 'image/png',
      buffer: PNG_SINTETICO,
    });
    await expect(page.getByText('Evidencia lista: evidencia-sintetica.png')).toBeVisible();

    // El aviso de ubicación sigue visible: no se perdió al completar la foto.
    await expect(page.getByText(/Puedes continuar sin ella/)).toBeVisible();
  });
});