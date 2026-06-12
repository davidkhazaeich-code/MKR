import { defineConfig } from '@playwright/test';

export default defineConfig({
  // testDir racine : couvre tests/i18n/ et tests/affiliate/ dans un meme run.
  // npm run test:i18n reste valide (playwright test = tous les projets).
  // Pour cibler un seul projet : npx playwright test --project=i18n
  //                               npx playwright test --project=affiliate
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
