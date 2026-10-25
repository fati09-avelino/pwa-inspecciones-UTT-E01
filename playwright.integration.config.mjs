import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/integration', testMatch: '**/*.spec.mjs',
  forbidOnly: !!process.env.CI, retries: 0, workers: 1, timeout: 30000,
  outputDir: 'test-results/integration',
  reporter: [
    ['list'], ['junit', { outputFile: 'reports/integration/junit.xml' }],
    ['html', { outputFolder: 'reports/integration/html', open: 'never' }],
  ],
  use: { browserName: 'chromium', serviceWorkers: 'block', trace: 'retain-on-failure' },
});
