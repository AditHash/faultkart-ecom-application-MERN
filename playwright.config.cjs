const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: { timeout: 12000 },
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: process.env.FAULTKART_WEB_URL || 'http://127.0.0.1:5173', browserName: 'chromium',
    ...(process.env.FAULTKART_BROWSER_CHANNEL ? { channel: process.env.FAULTKART_BROWSER_CHANNEL } : {}),
    screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  outputDir: 'test-results'
});
