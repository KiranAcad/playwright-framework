import { Page } from '@playwright/test';
import { DashboardPage } from './DashboardPage';

export class LoginPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async enterUsername(username: string) {
    await this.page.fill('input[name="username"]', username);
  }

  async enterPassword(password: string) {
    await this.page.fill('input[name="password"]', password);
  }

  async clickLogin(): Promise<DashboardPage> {
    await this.page.click('button[type="submit"]');
    return new DashboardPage(this.page);
  }
}
