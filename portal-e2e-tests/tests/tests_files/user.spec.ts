import { expect, test } from '../fixtures/baseFixtures.js';
import LoginPage from '../model/login.pageModel';
import { removeUser } from '../db-utils/user.helper';
import { addOrganization } from '../db-utils/organization.helper';

test.beforeAll('Add necessary data for tests', async () => {
  await addOrganization('Thales');
});
test('should confirm CRUD of users is ok', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login();
  await page.getByLabel('Settings menu').click();
  await page.getByRole('link', { name: 'Users' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Users list'
  );

  // Create User

  await page.getByLabel('Create user').click();
  await page
    .getByPlaceholder('Email', { exact: true })
    .fill('userInE2E@thales.com');
  await page.getByPlaceholder('Email', { exact: true }).press('Tab');
  await page.getByPlaceholder('First name').fill('firstname');
  await page.getByPlaceholder('First name').press('Tab');
  await page.getByPlaceholder('Last name').fill('lastname');
  await page.getByPlaceholder('Last name').press('Tab');
  await page.getByPlaceholder('Password').fill('azert');
  await page.getByPlaceholder('Password').press('Tab');
  await page.getByLabel('Roles').press('Enter');
  await page.getByText('USER', { exact: true }).click();
  await page.getByLabel('Organizations').press('Enter');
  await page.getByText('Thales', { exact: true }).click();
  await page.getByRole('button', { name: 'Validate' }).click();
  await expect(
    page.getByRole('cell', { name: 'userInE2E@thales.com' })
  ).toBeVisible();

  // Edit user
  await page.getByRole('cell', { name: 'userInE2E@thales.com' }).click();
  await expect(
    page.getByRole('heading', { name: 'userInE2E@thales.com' })
  ).toBeVisible();

  await page.getByLabel('Edit').click();
  await page.getByPlaceholder('First name').click();
  await page.getByPlaceholder('First name').fill('firstnameModified');
  await page.getByRole('button', { name: 'Validate' }).click();
  await expect(
    page.getByRole('heading', { name: 'firstnameModified lastname' })
  ).toBeVisible();

  // Delete user
  await page.getByLabel('Delete User').click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(
    page.getByRole('heading', { name: 'firstnameModified lastname' })
  ).toBeVisible();
  await page.getByLabel('Delete User').click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(
    page.getByRole('cell', { name: 'userInE2E@thales.com' })
  ).not.toBeVisible();
});

test.afterAll('Remove newly created user', async () => {
  await removeUser('userInE2E@thales.com');
});
