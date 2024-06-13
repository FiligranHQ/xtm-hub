import { expect, test } from '../../fixtures/baseFixtures';

test('should navigate to the organization page', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Settings menu').click();
  await expect(page.getByRole('link', { name: 'Organizations' })).toBeVisible();
  await page.getByText('Organizations').click();
  await page.getByRole('row', { name: 'Internal' }).getByRole('button').click();
  await expect(page).toHaveScreenshot();
});

test('should confirm CRUD of organizations is OK', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Settings menu').click();
  await expect(page.getByRole('link', { name: 'Organizations' })).toBeVisible();
  await page.getByText('Organizations').click();

  await page.getByLabel('Create Organization').click();
  await expect(page).toHaveScreenshot();
  await page.getByPlaceholder('Name').fill('newOrgae2e');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(
    page.getByRole('cell', { name: 'Delete Organization newOrgae2e' })
  ).toBeVisible();

  await page
    .getByRole('cell', { name: 'Delete Organization newOrgae2e' })
    .getByLabel('Delete Organization')
    .click();
  await expect(page).toHaveScreenshot();
  await page.getByPlaceholder('Name').fill('newName');

  await page.getByRole('button', { name: 'Update' }).click();
  await expect(
    page.getByRole('cell', { name: 'Delete Organization newName' })
  ).toBeVisible();
  await page
    .getByRole('row', { name: 'Delete Organization newName' })
    .getByLabel('Delete Organization')
    .nth(1)
    .click();
  await expect(page).toHaveScreenshot();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(
    page.getByRole('cell', { name: 'Delete Organization newName' })
  ).toBeVisible();
  await page
    .getByRole('row', { name: 'Delete Organization newName' })
    .getByLabel('Delete Organization')
    .nth(1)
    .click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(
    page.getByRole('cell', { name: 'Delete Organization newName' })
  ).not.toBeVisible();
});
