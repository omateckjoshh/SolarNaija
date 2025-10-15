import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  expect: { timeout: 5000 },
  use: {
    headless: true,
    baseURL: 'http://localhost:5173',
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 }
  }
});
