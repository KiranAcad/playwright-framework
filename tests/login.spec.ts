
import { test } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Dashboard Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/web/index.php/dashboard/index');
  });

  test('TC01 - Validate Dashboard After Login', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.validateDashboardLoaded();
  });

  test('TC02 - Validate Dashboard Components', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.validateDashboardLoaded(); 
    await dashboard.validateAllCoreComponents();
  });

});
