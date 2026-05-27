import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/i18n',
  fullyParallel: true,
  workers: 4,
  timeout: 30000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    headless: true,
  },
  reporter: [['list']],
});
