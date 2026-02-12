// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import { config } from './config/config';
import path from 'path';

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./global-setup'),
  timeout: 60000,
  expect: { timeout: 5000 },
  reporter: [['html'], ['list']],

  use: {
    baseURL: config.baseUrl,
    storageState: path.resolve(__dirname, 'storage/auth.json'), // ✅ full path
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'Desktop', use: { ...devices['Desktop Chrome'] } },
  ],
});
