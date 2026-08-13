import { expect, test } from '../../fixtures/baseFixtures.js';
import LoginPage from '../../model/login.pageModel';
import UserPage from '../../model/user.pageModel';
import { removeUser } from '../../db-utils/user.helper';
import {
  announceCheckpoint,
  announceIntro,
  announceStep,
} from './demo-caption.util';

/**
 * Demo video for: User_Organization.user_id (CASCADE)
 *
 * Shows that deleting a user who is a member of a shared organization
 * also removes their membership row, and that the change is reflected
 * live in that organization's member list.
 *
 * Run with: yarn test:e2e:demo tests/tests_files/demo/user-organization-cascade-delete.spec.ts
 */
const TEST_TITLE = 'User_Organization.user_id (CASCADE)';
const TEST_DESCRIPTION =
  'Shows that deleting a user who is a member of a shared organization also removes ' +
  "their membership row, and that the change is reflected live in that organization's " +
  'member list.';
const SHARED_ORGANIZATION_NAME = 'SECOND ORGA';
const ORG_ADMIN_EMAIL = 'admin@second-orga.com';
const TEST_USER_EMAIL = 'cascade-demo-user@second-orga.com';

test.describe('Cascade delete demo: User_Organization', () => {
  let loginPage: LoginPage;
  let userPage: UserPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    userPage = new UserPage(page);
  });

  test.afterEach(async () => {
    // Safety net in case the UI deletion step didn't complete.
    await removeUser(TEST_USER_EMAIL);
  });

  test('deleting a user removes them from their shared organization member list', async ({
    page,
  }) => {
    await test.step('Introduce the scenario', async () => {
      await loginPage.navigateTo();
      await announceIntro(page, TEST_TITLE, TEST_DESCRIPTION);
    });

    await test.step('Super-admin creates a test user in the shared organization', async () => {
      await loginPage.login();
      await userPage.navigateToUserListAdmin();
      await announceStep(
        page,
        `Creating test user ${TEST_USER_EMAIL} in ${SHARED_ORGANIZATION_NAME}`
      );

      await userPage.addUser(TEST_USER_EMAIL, SHARED_ORGANIZATION_NAME);

      await expect(
        page.getByRole('cell', { name: TEST_USER_EMAIL, exact: true })
      ).toBeVisible();
      await announceCheckpoint(
        page,
        `Check: ${TEST_USER_EMAIL} now appears in the users list`
      );

      await loginPage.logout();
    });

    await test.step('Organization admin confirms the user appears in the member list', async () => {
      await loginPage.navigateToAndLogin(ORG_ADMIN_EMAIL);
      await announceStep(
        page,
        `Checking that ${TEST_USER_EMAIL} appears in the ${SHARED_ORGANIZATION_NAME} member list`
      );

      // Org admins (non-bypass) see a direct "Users" sidebar link,
      // unlike super-admins who go through "Settings" > "Security".
      await page.getByRole('link', { name: 'Users' }).click();
      await userPage.assertCurrentPage();

      await expect(
        page.getByRole('cell', { name: TEST_USER_EMAIL, exact: true })
      ).toBeVisible();
      await announceCheckpoint(
        page,
        `Check: ${TEST_USER_EMAIL} is a member of ${SHARED_ORGANIZATION_NAME}`
      );

      await loginPage.logout();
    });

    await test.step('Super-admin deletes the test user', async () => {
      await loginPage.navigateToAndLogin();
      await userPage.navigateToUserListAdmin();
      await announceStep(page, `Deleting test user ${TEST_USER_EMAIL}`);

      await userPage.deleteUser(TEST_USER_EMAIL);

      await expect(
        page.getByRole('cell', { name: TEST_USER_EMAIL, exact: true })
      ).not.toBeVisible();
      await announceCheckpoint(
        page,
        `Check: ${TEST_USER_EMAIL} no longer appears in Admin > Users`
      );

      await loginPage.logout();
    });

    await test.step('Organization admin reloads the member list and confirms the user is gone', async () => {
      await loginPage.navigateToAndLogin(ORG_ADMIN_EMAIL);

      await page.getByRole('link', { name: 'Users' }).click();
      await userPage.assertCurrentPage();
      await announceStep(
        page,
        `Reloading the ${SHARED_ORGANIZATION_NAME} member list to confirm ${TEST_USER_EMAIL} is gone`
      );
      await page.reload();

      await expect(
        page.getByRole('cell', { name: TEST_USER_EMAIL, exact: true })
      ).not.toBeVisible();
      await announceCheckpoint(
        page,
        `Check: ${TEST_USER_EMAIL} was removed from the ${SHARED_ORGANIZATION_NAME} member list (cascade delete confirmed)`
      );
    });
  });
});
