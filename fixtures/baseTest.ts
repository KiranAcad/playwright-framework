import { test as base, expect, Page, Browser, TestInfo } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { config } from '../config/config';
import path from 'path';
import fs from 'fs';

type TestFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  
  // Uses storage state file produced by global-setup.ts when available.
  authenticatedPage: async (
    { browser }: { browser: Browser },
    use: (page: Page) => Promise<void>,
    testInfo: TestInfo
  ) => {

    const storagePath = path.resolve(__dirname, '..', 'storage', 'auth.json');
    const contextOpts: any = { baseURL: config.baseUrl };
    if (fs.existsSync(storagePath)) contextOpts.storageState = storagePath;

    const context = await browser.newContext(contextOpts);

    const page = await context.newPage();

    await page.goto('/web/index.php/dashboard/index');

    await use(page);

    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach('failure-screenshot', {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
    }

    await context.close();
  }

});

export { expect };
