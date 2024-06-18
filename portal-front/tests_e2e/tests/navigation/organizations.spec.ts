import { expect, test } from '../../fixtures/baseFixtures';

test('should confirm CRUD of organizations is OK', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Settings menu').click();
  await expect(page.getByRole('link', { name: 'Organizations' })).toBeVisible();
  await page.getByText('Organizations').click();

  // Create organization
  await page.getByLabel('Create Organization').click();
  await expect(page).toHaveScreenshot();
  await page.getByPlaceholder('Name').fill('newOrgae2e');
  await page.getByRole('button', { name: 'Validate' }).click();
  await expect(
    page.getByRole('cell', { name: 'Edit Organization newOrgae2e' })
  ).toBeVisible();

  // Edit Organization
  await page
    .getByRole('row', { name: 'Edit Organization newOrgae2e' })
    .getByLabel('Edit Organization')
    .click();

  await expect(page).toHaveScreenshot();
  await page.getByPlaceholder('Name').fill('newName');

  await page.getByRole('button', { name: 'Validate' }).click();
  await expect(
    page.getByRole('cell', { name: 'Edit Organization newName' })
  ).toBeVisible();

  // Delete Organization
  await page
    .getByRole('row', { name: 'Edit Organization newName' })
    .getByLabel('Delete Organization')
    .click();
  await expect(page).toHaveScreenshot();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(
    page.getByRole('cell', { name: 'Edit Organization newName' })
  ).toBeVisible();
  await page
    .getByRole('row', { name: 'Edit Organization newName' })
    .getByLabel('Delete Organization')
    .click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(
    page.getByRole('cell', { name: 'Delete Organization newName' })
  ).not.toBeVisible();
});
