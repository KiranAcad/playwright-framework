import { Page, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async click(locator: string) {
    await this.page.locator(locator).click();
    return this; // 🔥 method chaining
  }

  async fill(locator: string, value: string) {
    await this.page.locator(locator).fill(value);
    return this;
  }

  async waitForVisible(locator: string) {
    await this.page.locator(locator).waitFor({ state: 'visible' });
    return this;
  }

  async validateText(locator: string, expectedText: string) {
    await expect(this.page.locator(locator)).toHaveText(expectedText);
    return this;
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
    return this;
  }
}
