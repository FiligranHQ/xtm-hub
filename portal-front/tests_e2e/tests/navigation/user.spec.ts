import { expect, test } from '../../fixtures/baseFixtures';

test('should navigate to the user page', async ({ page }) => {
  // TODO make more accessible component and rewrite test
  await page.goto('/');
  await page.getByLabel('Settings menu').click();
  await page.getByRole('link', { name: 'User', exact: true }).click();
  await expect(page.getByRole('link', { name: 'User' })).toBeVisible();
  await page
    .getByRole('row', { name: 'admin@filigran.io Details' })
    .getByRole('link')
    .click();
  await expect(
    page.getByRole('heading', { name: '(Internal) - admin@filigran.io' })
  ).toBeVisible();
  await expect(page).toHaveScreenshot();
});
