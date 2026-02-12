import { test as base, expect } from '@playwright/test';
import type { Page, TestInfo } from '@playwright/test';
import { config } from '../config/config';
import { TestDataManager } from '../utils/testDataManager';
import path from 'path';
import fs from 'fs';

type TestFixtures = {
  authenticatedPage: Page;
  testDataManager: TestDataManager;
};

export const test = base.extend<TestFixtures>({

  testDataManager: async ({}, use) => {
    const manager = new TestDataManager();

    console.log('🔧 TestDataManager initialized');

    try {
      await use(manager);
    } finally {
      console.log('🧹 Running test data cleanup...');
      await manager.cleanup();
    }
  },

  authenticatedPage: async ({ browser }, use, testInfo: TestInfo) => {

    const storagePath = path.resolve(__dirname, '..', 'storage', 'auth.json');

    const context = await browser.newContext({
      baseURL: config.baseUrl,
      storageState: fs.existsSync(storagePath) ? storagePath : undefined,
    });

    const page = await context.newPage();

    // Optional: Start tracing (great for debugging)
    await context.tracing.start({
      screenshots: true,
      snapshots: true,
    });

    // Navigate to dashboard (already authenticated)
    await page.goto('/web/index.php/dashboard/index');

    try {
      await use(page);
    } finally {

      // Screenshot on failure
      if (testInfo.status !== testInfo.expectedStatus) {
        await testInfo.attach('failure-screenshot', {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        });

        // Save trace on failure
        await context.tracing.stop({
          path: `test-results/trace-${testInfo.title}.zip`,
        });
      } else {
        await context.tracing.stop();
      }

      await context.close();
    }
  }

});

export { expect };
