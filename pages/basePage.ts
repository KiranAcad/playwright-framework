import { Page, expect } from '@playwright/test';
import { logger } from '../utils/logger';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async click(locator: string) {
    logger.debug(`🖱️ Click: ${locator}`);
    await this.page.locator(locator).click();
    return this;
  }

  async fill(locator: string, value: string) {
    logger.debug(`✏️ Fill: ${locator} → "${value}"`);
    await this.page.locator(locator).fill(value);
    return this;
  }

  async waitForVisible(locator: string) {
    logger.debug(`👁️ WaitForVisible: ${locator}`);
    await this.page.locator(locator).waitFor({ state: 'visible' });
    return this;
  }

  async validateText(locator: string, expectedText: string) {
    logger.debug(`✅ ValidateText: ${locator} === "${expectedText}"`);
    await expect(this.page.locator(locator)).toHaveText(expectedText);
    return this;
  }

  async takeScreenshot(name: string) {
    logger.info(`📸 Screenshot: ${name}`);
    await this.page.screenshot({ path: `screenshots/${name}.png` });
    return this;
  }
}
