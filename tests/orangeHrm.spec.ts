import { test, expect } from '@playwright/test';
import { OrangeHrmPage } from '../pages/orangeHrmPage';

test('Day 3 - BasePage reusable methods using OrangeHRM demo', async ({ page }) => {
  const orangeHrmPage = new OrangeHrmPage(page);
  await page.goto('https://opensource-demo.orangehrmlive.com/');
  await orangeHrmPage.login('Admin', 'admin123');
  await orangeHrmPage.waitForDashboard();
  await orangeHrmPage.scrollToAdminMenu();
  await orangeHrmPage.captureDashboardScreenshot();
  await expect(page).toHaveURL(/dashboard/);
});
