import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class GooglePage extends BasePage {
  searchInput: Locator;
  searchButton: Locator;
  firstResult: Locator;
  footerLink: Locator;

  constructor(page: Page) {
    super(page);

    this.searchInput = this.page.locator('textarea[name="q"]');
    this.searchButton = this.page.locator('input[name="btnK"]').first();
    this.firstResult = this.page.locator('h3').first();
    this.footerLink = this.page.locator('text=Advertising');
  }

  async searchText(text: string) {
    await this.fillInput(this.searchInput, text, 'Google Search Box');
    await this.clickElement(this.searchButton, 'Google Search Button');
  }

  async waitForSearchResults() {
    await this.waitForElement(this.firstResult);
  }

  async scrollToFooter() {
    await this.scrollTo(this.footerLink);
  }

  async captureSearchResultScreenshot() {
    await this.takeScreenshot('google-search-results');
  }
}
