import { defineConfig } from '@playwright/test';
// Sin tests, Playwright debe terminar con error.
export default defineConfig({
  testDir: './tests/e2e', testMatch: '**/*.spec.{ts,js,mjs}',
  forbidOnly: !!process.env.CI, retries: 0, workers: 1, timeout: 45000,
  outputDir: 'test-results/e2e',
  reporter: [
    ['list'], ['junit', { outputFile: 'reports/e2e/junit.xml' }],
    ['html', { outputFolder: 'reports/e2e/html', open: 'never' }],
  ],
  use: { browserName: 'chromium', baseURL: 'http://127.0.0.1:3008', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run start -- --hostname 127.0.0.1 --port 3008',
    env: { PWA_SYNTHETIC_STORE: '.pwa-data/e2e-' + process.pid + '.json' },
    url: 'http://127.0.0.1:3008/inspecciones', reuseExistingServer: false, timeout: 120000,
  },
});
