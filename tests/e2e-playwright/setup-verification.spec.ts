import { test, expect } from '@playwright/test';

test.describe('Basic Playwright Setup', () => {
  test('should be able to navigate to a website', async ({ page }) => {
    // Test with a public website to verify Playwright is working
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
    await expect(page.getByText('Example Domain')).toBeVisible();
  });

  test('should handle basic page interactions', async ({ page }) => {
    await page.goto('https://example.com');
    
    // Test basic functionality like clicking
    const moreInfoLink = page.getByText('More information...');
    if (await moreInfoLink.isVisible()) {
      await moreInfoLink.click();
      // Should navigate to a different page
      await expect(page).toHaveURL(/iana.org/);
    }
  });
});