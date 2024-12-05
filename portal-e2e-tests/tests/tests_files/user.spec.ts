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
  await page.getByRole('dialog').getByRole('link', { name: 'Users' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Users list'
  );

  // Add User

  await page.getByLabel('Add user').click();
  await page
    .getByPlaceholder('Email', { exact: true })
    .fill('userInE2E@thales.com');
  await page.getByPlaceholder('Email', { exact: true }).press('Tab');
  await page.getByLabel('Roles').press('Enter');
  await page.getByRole('option', { name: 'USER' }).click();
  await page.getByLabel('Organizations').press('Enter');
  await page.getByText('Thales', { exact: true }).click();
  await page.getByRole('button', { name: 'Validate' }).click();
  await expect(
    page.getByRole('cell', { name: 'userInE2E@thales.com' })
  ).toBeVisible();

  // Edit user
  await page
    .getByRole('row', { name: 'userInE2E@thales.com' })
    .getByRole('button')
    .click();
  await page.getByLabel('Details User').click();
  await expect(
    page.getByRole('heading', { name: 'userInE2E@thales.com' })
  ).toBeVisible();

  await page.getByLabel('Update').click();
  await page.getByLabel('Roles').press('Enter');
  await page.getByRole('option', { name: 'ADMIN_ORGA' }).click();
  await page.getByRole('button', { name: 'Validate' }).click();
  await expect(
    page.getByRole('heading', { name: 'userInE2E@thales.com' })
  ).toBeVisible();

  // Delete user
  await page.getByLabel('Delete User').click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(
    page.getByRole('heading', { name: 'userInE2E@thales.com' })
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
