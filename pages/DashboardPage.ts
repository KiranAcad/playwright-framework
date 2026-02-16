// pages/DashboardPage.ts
import { Locator, expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {

  private readonly dashboardHeading: Locator;
  private readonly dashboardWidgets: Locator;

  // 🔹 Centralized core components list
  private readonly coreComponents = [
    'Time at Work',
    'My Actions',
    'Quick Launch',
    'Buzz Latest Posts',
    'Employees on Leave Today',
    'Employee Distribution by Sub'
  ];

  constructor(page: Page) {
    super(page);

    this.dashboardHeading = this.page.getByRole('heading', { name: 'Dashboard' });
    this.dashboardWidgets = this.page.locator('.oxd-grid-item');
  }

  getDashboardComponent(name: string): Locator {
    return this.page.getByText(name, { exact: false });
  }

  async validateDashboardLoaded(): Promise<this> {
    await this.page.waitForLoadState('domcontentloaded');

    await expect(this.dashboardHeading).toBeVisible({ timeout: 20000 });
    await expect(this.dashboardWidgets.first()).toBeVisible();

    console.log('✅ Dashboard page fully loaded and validated');
    return this;
  }

  async validateComponentVisible(componentName: string): Promise<this> {
    await expect(this.getDashboardComponent(componentName)).toBeVisible();
    console.log(`✅ Component "${componentName}" validated`);
    return this;
  }

  async validateAllCoreComponents(): Promise<this> {
    for (const component of this.coreComponents) {
      await this.validateComponentVisible(component);
    }

    console.log('✅ All dashboard components validated successfully');
    return this;
  }
}
