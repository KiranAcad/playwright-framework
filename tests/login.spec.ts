import { test, expect } from '../fixtures/baseTest';



test.describe('Dashboard Suite', () => {

  test('TC01 - Validate Dashboard After Login', async ({ dashboardPage }) => {
    await dashboardPage.validateDashboardLoaded();
  });

  test('TC02 - Validate Dashboard Components', async ({ dashboardPage }) => {
  await dashboardPage.validateDashboardLoaded();
  await dashboardPage.validateAllCoreComponents();
});

});



test.describe('TestDataManager Verification Suite', () => {

  test('TC01 - Should store and retrieve created test items', async ({ testDataManager }) => {
    
    testDataManager.add('User-123');
    testDataManager.add('Course-456');

    const items = testDataManager.getAll();

    expect(items).toContain('User-123');
    expect(items).toContain('Course-456');
    expect(items.length).toBe(2);

    console.log('✅ TestDataManager storing works correctly');
  });

});
