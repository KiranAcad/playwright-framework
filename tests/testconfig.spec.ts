import { test, expect } from '@playwright/test';
import { getConfig } from '../config/configLoader';
import { collegeUrls } from '../config/collegeUrls';

test.describe('Runtime Config Validation', () => {
  test('Base URL matches runtime config', () => {
    const { baseUrl, college, env } = getConfig();
    const expectedUrl = collegeUrls[college][env];
    console.log(
      `Running test for College: ${college}, Environment: ${env}, Base URL: ${baseUrl}`
    );
    expect(baseUrl).toBe(expectedUrl);
  });
});
