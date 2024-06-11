import { expect, test } from '../../fixtures/baseFixtures';

test('should navigate to the organization page', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Settings menu').click();
  await expect(page.getByRole('link', { name: 'Organizations' })).toBeVisible();
  await page.getByText('Organizations').click();
  await page.getByRole('row', { name: 'Internal' }).getByRole('button').click();
  await expect(page).toHaveScreenshot();
});
