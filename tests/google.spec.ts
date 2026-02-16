import { test } from '../fixtures/baseTest';

test('TC01 - Validate Google Search', async ({ googleLandingPage }) => {
  await googleLandingPage.navigate();
  await googleLandingPage.validateSearchFunctionality('Playwright Automation');
});
