import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page', async ({ page }) => {
    await expect(page).toHaveTitle(/Google Maps Data Extractor/);
    await expect(page.getByRole('heading', { name: /Extract Business Data from Google Maps/i })).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.getByRole('link', { name: /log in/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors on registration', async ({ page }) => {
    await page.goto('/register');

    // Try to submit empty form
    await page.getByRole('button', { name: /sign up/i }).click();

    // Form validation should prevent submission (no navigation)
    await expect(page).toHaveURL(/\/register/);
  });

  test('should show validation errors on login', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Form validation should prevent submission
    await expect(page).toHaveURL(/\/login/);
  });

  test('should fill registration form', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/^password/i).first().fill('TestPassword123!');

    // Verify form is filled
    await expect(page.getByLabel(/name/i)).toHaveValue('Test User');
    await expect(page.getByLabel(/email/i)).toHaveValue('test@example.com');
  });

  test('should fill login form', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('TestPassword123!');

    // Verify form is filled
    await expect(page.getByLabel(/email/i)).toHaveValue('test@example.com');
  });
});
