import { test, expect } from '@playwright/test';
import { GooglePage } from '../pages/googlePage';

test('Day 3 - BasePage reusable methods demo', async ({ page }) => {
  const googlePage = new GooglePage(page);

  await page.goto('https://www.google.com');

  await googlePage.searchText('Playwright automation');
  await googlePage.waitForSearchResults();
  await googlePage.scrollToFooter();
  await googlePage.captureSearchResultScreenshot();

  await expect(page).toHaveTitle(/Playwright/);
});
