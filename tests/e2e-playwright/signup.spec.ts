import { test, expect } from '@playwright/test';

test.describe('Signup Flow', () => {
  test('displays signup form with all fields', async ({ page }) => {
    await page.goto('/signup');
    
    await expect(page).toHaveTitle(/SmartPath/);
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/username/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('validates username availability', async ({ page }) => {
    await page.goto('/signup');
    
    const usernameField = page.getByPlaceholder(/username/i);
    await usernameField.fill('testuser');
    
    await page.waitForTimeout(1000);
    
    const availabilityIndicator = page.locator('[data-testid="username-availability"]');
    await expect(availabilityIndicator).toBeVisible();
  });

  test('shows validation errors for invalid inputs', async ({ page }) => {
    await page.goto('/signup');
    
    await page.getByPlaceholder(/email/i).fill('invalid-email');
    await page.getByPlaceholder(/password/i).fill('123');
    await page.getByRole('button', { name: /create account/i }).click();
    
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('navigates back to login page', async ({ page }) => {
    await page.goto('/signup');
    
    const loginLink = page.getByRole('link', { name: /sign in/i });
    await loginLink.click();
    
    await expect(page).toHaveURL(/^(?!.*signup).*$/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('includes branding elements', async ({ page }) => {
    await page.goto('/signup');
    
    await expect(page.getByText(/smartpath/i)).toBeVisible();
  });
});