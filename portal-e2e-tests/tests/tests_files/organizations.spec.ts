import { expect, test } from '../fixtures/baseFixtures.js';
import LoginPage from "../model/login.pageModel";
import {removeOrganization} from "../db-utils/organization.helper";

test('should confirm CRUD of organizations is OK', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login();
  await page.getByLabel('Settings menu').click();
  await expect(
      page.getByRole('link', { name: 'Organizations' })
  ).toBeVisible();
  await page.getByText('Organizations').click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Organizations list'
  );

  // Create organization
  await page.getByLabel('Create Organization').click();
  await page.getByPlaceholder('Name').fill('newOrgae2e');
  await page.getByRole('button', { name: 'Validate' }).click();
  await expect(page.getByRole('cell', { name: 'newOrgae2e' })).toBeVisible();

  // Edit Organization
  await page.getByRole('row', { name: 'newOrgae2e Open menu' }).getByRole('button').click();
  await page.getByLabel('Edit Organization').click();
  await page.getByPlaceholder('Name').fill('newName');
  await page.getByRole('button', { name: 'Validate' }).click();
  await expect(page.getByRole('cell', { name: 'newName' })).toBeVisible();

  // Delete Organization
  await page.getByRole('row', { name: 'newName Open menu' }).getByRole('button').click();
  await page.getByLabel('Delete Organization').click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('cell', { name: 'newName' })).not.toBeVisible();
});

test.afterAll('Remove organization', async() => {
    await removeOrganization('newName');
})
