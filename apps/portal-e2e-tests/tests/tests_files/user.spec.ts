import { expect, test } from '../fixtures/baseFixtures.js';
import LoginPage from '../model/login.pageModel';
import { removeUser } from '../db-utils/user.helper';
import { addOrganization } from '../db-utils/organization.helper';
import UserPage from '../model/user.pageModel';

const TEST_USER = {
  userOrganizationName: 'Thales',
  userEmail: 'userInE2E@thales.com',
  adminThales: 'admin@thales.com',
  otherThalesUserEmail: 'user@thales.com',
};

test.describe('User Management', () => {
  let loginPage;
  let userPage;

  test.beforeEach(async ({ page }) => {
    await addOrganization(TEST_USER.userOrganizationName);

    loginPage = new LoginPage(page);
    userPage = new UserPage(page);
  });

  test('Should perform complete CRUD of users as BYPASS', async ({ page }) => {
    await loginPage.navigateToAndLogin();
    await userPage.navigateToUserListAdmin();

    await test.step('Add user', async () => {
      await userPage.addUser(
        TEST_USER.userEmail,
        TEST_USER.userOrganizationName
      );
      await expect(
        page
          .getByRole('cell', { name: TEST_USER.userEmail, exact: true })
          .locator('span')
      ).toBeVisible();
    });

    await test.step('Edit user', async () => {
      await userPage.editUser(TEST_USER.userEmail);
      await expect(
        page.getByRole('heading', { name: TEST_USER.userEmail })
      ).toBeVisible();
    });

    await test.step('Disable user', async () => {
      await userPage.disableUser(TEST_USER.userEmail);
      await expect(page.getByRole('cell', { name: 'Disabled' })).toBeVisible();
    });
  });

  test('Should only see authorized users', async ({ page }) => {
    await loginPage.navigateToAndLogin();

    await userPage.navigateToUserListAdmin();
    await expect(page.getByText(TEST_USER.otherThalesUserEmail)).toBeVisible();
    await userPage.navigateToUserManageAccess();
    await expect(
      page.getByText(TEST_USER.otherThalesUserEmail)
    ).not.toBeVisible();
    await loginPage.logout();
    await loginPage.navigateToAndLogin(TEST_USER.userEmail);
    await expect(
      page.getByRole('button', { name: 'Settings' })
    ).not.toBeVisible();
  });
  test('Should not edit first and last name as MANAGE_ACCESS user', async ({
    page,
  }) => {
    await loginPage.navigateToAndLogin(TEST_USER.adminThales);
    await page.getByRole('link', { name: 'Users' }).click();
    await page.getByRole('button', { name: 'Add user' }).click();
    await expect(
      page.getByRole('textbox', { name: 'First name' })
    ).not.toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Last name' })
    ).not.toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByText(TEST_USER.otherThalesUserEmail).click();
    await expect(
      page.getByRole('textbox', { name: 'First name' })
    ).not.toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Last name' })
    ).not.toBeVisible();
  });
});
