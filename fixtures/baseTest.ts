import { test as base, expect } from '@playwright/test';
import type { Page, TestInfo } from '@playwright/test';
import { config } from '../config/config';
import { TestDataManager } from '../utils/testDataManager';
import path from 'path';
import fs from 'fs';
import { DashboardPage } from '@pages/DashboardPage';
import { GoogleLandingPage } from '@pages/GoogleLandingPage';


type TestFixtures = {
  authenticatedPage: Page;
  testDataManager: TestDataManager;
  dashboardPage: DashboardPage;
  googleLandingPage:GoogleLandingPage;
};

export const test = base.extend<TestFixtures>({

  // 🔹 Test Data Manager Fixture
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

  // 🔹 Authenticated Page Fixture
  authenticatedPage: async ({ browser }, use, testInfo: TestInfo) => {

    const storagePath = path.resolve(__dirname, '..', 'storage', 'auth.json');

    const context = await browser.newContext({
      baseURL: config.baseUrl,
      storageState: fs.existsSync(storagePath) ? storagePath : undefined,
    });

    const page = await context.newPage();

    await context.tracing.start({
      screenshots: true,
      snapshots: true,
    });

    await page.goto('/web/index.php/dashboard/index');

    try {
      await use(page);
    } finally {

      if (testInfo.status !== testInfo.expectedStatus) {

        // 📸 Screenshot on failure
        await testInfo.attach('failure-screenshot', {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        });

        // 📦 Save trace only on failure
        await context.tracing.stop({
          path: `test-results/trace-${testInfo.title.replace(/\s+/g, '_')}.zip`,
        });

      } else {
        await context.tracing.stop();
      }

      await context.close();
    }
  },

 

  // 🔹 Google Landing Page Fixture (NEW)
  googleLandingPage: async ({ page }, use) => {
    const googlePage = new GoogleLandingPage(page);
    console.log('🔍 GoogleLandingPage fixture initialized');
    await use(googlePage);
  }

});

export { expect };
