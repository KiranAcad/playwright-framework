import { test, expect } from '../fixtures/baseTest';
import { DashboardPage } from '../pages/DashboardPage';


//sample test cases to check framework flow
test.describe('Dashboard Suite', () => {

  test('TC01 - Validate Dashboard After Login', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.validateDashboardLoaded();
  });

  test('TC02 - Validate Dashboard Components', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);
    await dashboard.validateDashboardLoaded();
    await dashboard.validateAllCoreComponents();
  });

});


//data cleanup sample test cases
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
