// pages/DashboardPage.ts
import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {

  
  private readonly dashboardHeading: Locator;
  private readonly dashboardWidgets: Locator;

  constructor(page: any) {
    super(page);

    this.dashboardHeading = this.page.getByRole('heading', { name: 'Dashboard' });
    this.dashboardWidgets = this.page.locator('.oxd-grid-item');
  }



  getDashboardComponent(name: string): Locator {
    return this.page.getByText(name);
  }

  
  async validateDashboardLoaded() {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.dashboardHeading).toBeVisible({ timeout: 20000 });
    await expect(this.dashboardWidgets.first()).toBeVisible();

    console.log('✅ Dashboard page fully loaded and validated');
    return this; // method chaining
  }

  async validateComponentVisible(componentName: string) {
    await expect(this.getDashboardComponent(componentName)).toBeVisible();
    console.log(`✅ Component "${componentName}" validated`);
    return this; // method chaining
  }

  async validateAllCoreComponents() {
    const components = ['Time at Work','My Actions','Quick Launch','Buzz Latest Posts','Employees on Leave Today','Employee Distribution by Sub'
    ];

    for (const component of components) {
      await this.validateComponentVisible(component);
    }

    console.log('✅ All dashboard components validated successfully');
    return this;
  }
}
