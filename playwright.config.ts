import { defineConfig } from '@playwright/test';

export default defineConfig({
  // testDir racine : couvre tests/i18n/ et tests/affiliate/ via 2 projets.
  // npm run test:i18n      = playwright test --project=i18n  (suite layout i18n)
  // npm run test:affiliate = playwright test --project=affiliate (flux ?ref, requiert serveur)
  // npx playwright test (sans filtre) lance les 2 projets.
  testDir: './tests',
  fullyParallel: true,
  workers: 4,
  timeout: 30000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    headless: true,
  },
  reporter: [['list']],
  projects: [
    {
      name: 'i18n',
      testDir: './tests/i18n',
    },
    {
      name: 'affiliate',
      // Necessite un serveur dev/preview actif sur baseURL (pas de webServer auto-start).
      // Lancer manuellement : npm run dev &  puis  npx playwright test --project=affiliate
      testDir: './tests/affiliate',
    },
  ],
});
