import { Page, Locator } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickElement(locator: Locator, elementName: string) {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      await locator.click();
      console.log(`Clicked on ${elementName}`);
    } catch (error) {
      console.error(`Failed to click on ${elementName}`, error);
      await this.takeScreenshot(`click-error-${elementName}`);
      throw error;
    }
  }

  async fillInput(locator: Locator, value: string, fieldName: string) {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      await locator.fill(value);
      console.log(`Entered value in ${fieldName}`);
    } catch (error) {
      console.error(`Failed to fill ${fieldName}`, error);
      await this.takeScreenshot(`fill-error-${fieldName}`);
      throw error;
    }
  }

  async waitForElement(locator: Locator) {
    await locator.waitFor({ state: 'visible', timeout: 5000 });
  }

  async scrollTo(locator: Locator) {
    try {
      await locator.scrollIntoViewIfNeeded();
    } catch (error) {
      console.error('Scroll failed', error);
    }
  }

  async takeScreenshot(fileName: string) {
    await this.page.screenshot({
      path: `screenshots/${fileName}.png`,
      fullPage: true
    });
  }
}
