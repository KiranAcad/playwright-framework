import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class OrangeHrmPage extends BasePage {
  usernameInput: Locator;
  passwordInput: Locator;
  loginButton: Locator;
  dashboardHeader: Locator;
  adminMenu: Locator;

  constructor(page: Page) {
    super(page);

    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.dashboardHeader = page.locator('h6:has-text("Dashboard")');
    this.adminMenu = page.locator('span:has-text("Admin")');
  }

  async login(username: string, password: string) {
    await this.fillInput(this.usernameInput, username, 'Username');
    await this.fillInput(this.passwordInput, password, 'Password');

    
    await this.clickElement(this.loginButton, 'Login Button');
  }

  async waitForDashboard() {
    await this.waitForElement(this.dashboardHeader);
  }

  async scrollToAdminMenu() {
    await this.scrollTo(this.adminMenu);
  }

  async captureDashboardScreenshot() {
    await this.takeScreenshot('orangehrm-dashboard');
  }
}
