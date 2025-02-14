import { expect, test } from '../fixtures/baseFixtures.js';
import LoginPage from '../model/login.pageModel';
import { removeUser } from '../db-utils/user.helper';
import { addOrganization } from '../db-utils/organization.helper';
import UserPage from '../model/user.pageModel';

const TEST_USER = {
  userOrganizationName: 'Thales',
  userEmail: 'userInE2E@thales.com',
  otherThalesUserEmail: 'user@thales.com',
};

test.describe('User Management', () => {
  let loginPage;
  let userPage;

  test.beforeEach(async ({ page }) => {
    await addOrganization(TEST_USER.userOrganizationName);

    loginPage = new LoginPage(page);
    userPage = new UserPage(page);

    await loginPage.login();
    await userPage.navigateToUserListAdmin();
  });

  test('Should perform complete CRUD of users', async ({ page }) => {
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
      await expect(
        page.getByRole('cell', { name: "Disabled" })
      ).toBeVisible();
    });
  });

  test('Should only see authorized users', async ({ page }) => {
    await userPage.navigateToUserListAdmin();
    await expect(page.getByText(TEST_USER.otherThalesUserEmail)).toBeVisible();
    await userPage.navigateToUserOrgaAdmin();
    await expect(
      page.getByText(TEST_USER.otherThalesUserEmail)
    ).not.toBeVisible();
    await loginPage.logout();
    await loginPage.login(TEST_USER.userEmail);
    await expect(
      page.getByRole('button', { name: 'Settings' })
    ).not.toBeVisible();
  });
  test.afterAll('Remove newly created user', async () => {
    await removeUser(TEST_USER.userEmail);
  });
});
