import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page).toHaveURL(/^(?!.*dashboard).*$/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('displays logo and navigation elements', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('SmartPath')).toBeVisible();
    
    const logo = page.getByRole('link', { name: /smartpath/i });
    if (await logo.isVisible()) {
      await expect(logo).toHaveAttribute('href', '/dashboard');
    }
  });

  test('maintains responsive design across viewports', async ({ page }) => {
    await page.goto('/');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('SmartPath')).toBeVisible();
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('SmartPath')).toBeVisible();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByText('SmartPath')).toBeVisible();
  });

  test('theme toggle works on accessible pages', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.getByRole('button', { name: /toggle.*theme/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await expect(page.getByText('Light')).toBeVisible();
      await expect(page.getByText('Dark')).toBeVisible();
    }
  });

  test('includes proper accessibility features', async ({ page }) => {
    await page.goto('/');
    
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

// Example of how you might test authenticated flows in the future
test.describe('Dashboard - Authenticated User', () => {
  test.skip('should display dashboard after login', async ({ page }) => {
    // This test is skipped because it requires authentication setup
    // In the future, you could use Playwright's auth setup to:
    // 1. Create a test user
    // 2. Login programmatically
    // 3. Test authenticated features
    
    // await page.goto('/');
    // await page.getByPlaceholder(/email/i).fill('test@example.com');
    // await page.getByPlaceholder(/password/i).fill('testpassword');
    // await page.getByRole('button', { name: /sign in/i }).click();
    // 
    // await expect(page).toHaveURL(/.*dashboard.*/);
    // await expect(page.getByText(/welcome/i)).toBeVisible();
  });
});