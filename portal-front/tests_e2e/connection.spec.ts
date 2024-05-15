import { test, expect } from '@playwright/test';

test('should navigate to the about page', async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto('/');
  // The new page should contain an h1 with "Sign in"
  await expect(page.locator('h1')).toContainText('Sign in');
  await page.getByPlaceholder('email').fill('admin@filigran.io');
  await page.getByPlaceholder('password').fill('admin');
  await page.getByText('Submit').click();
  await expect(page.locator('h1')).toContainText('Portal admin@filigran.io');
});
