import { chromium, FullConfig } from '@playwright/test';
import { config } from './config/config';
import { logger } from './utils/logger';
import path from 'path';

async function globalSetup(configFile: FullConfig) {
  logger.info('🔐 Performing one-time login...');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Always go to login page
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  logger.info('🌐 Navigated to login page');

  // Wait for login form properly
  await page.locator('input[name="username"]').waitFor({ state: 'visible' });

  await page.fill('input[name="username"]', config.username);
  await page.fill('input[name="password"]', config.password);
  logger.info('📝 Credentials entered');

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForURL('**/dashboard/**', { timeout: 60000 }),
  ]);

  // Wait for dashboard header (REAL selector for OrangeHRM)
  await page.locator('h6.oxd-text--h6').waitFor({ state: 'visible' });

  const storagePath = path.resolve(__dirname, 'storage/auth.json');
  await context.storageState({ path: storagePath });

  await browser.close();
  logger.info(`✅ Login state saved to ${storagePath}`);
}

export default globalSetup;
