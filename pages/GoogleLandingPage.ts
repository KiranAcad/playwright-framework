import { Locator, expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class GoogleLandingPage extends BasePage {

  private readonly searchInput: Locator;
  private readonly searchResults: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByRole('combobox', { name: 'Search' });
    this.searchResults = page.locator('#search');
  }

  async navigate(): Promise<void> {
    await this.page.goto('https://www.google.com');
  }

  async validateSearchFunctionality(searchText: string): Promise<void> {

    await this.searchInput.fill(searchText);
    await this.searchInput.press('Enter');

    await expect(this.searchResults).toBeVisible();
    await expect(this.page).toHaveTitle(new RegExp(searchText, 'i'));

    console.log(`✅ Search functionality validated for: ${searchText}`);
  }
}
