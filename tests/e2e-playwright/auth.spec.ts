import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('displays login form with required elements', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/SmartPath/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows validation on empty form submission', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('navigates to signup page correctly', async ({ page }) => {
    await page.goto('/');
    
    const signupLink = page.getByRole('link', { name: /sign up/i });
    await signupLink.click();
    
    await expect(page).toHaveURL(/.*signup.*/);
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });

  test('theme toggle works when available', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      
      await expect(page.getByText('Light')).toBeVisible();
      await expect(page.getByText('Dark')).toBeVisible();
    }
  });

  test('displays branding and key elements', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText(/smartpath/i)).toBeVisible();
  });
});