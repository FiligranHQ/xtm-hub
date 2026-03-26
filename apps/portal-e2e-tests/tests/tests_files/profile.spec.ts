import { expect, test } from '../fixtures/baseFixtures.js';
import LoginPage from '../model/login.pageModel';
import ProfilePage from '../model/profile.pageModel';

const TEST_PICTURE = {
  path: './tests/tests_files/assets/user-picture-test.png',
  successMessage: 'Success',
};

test.describe('Profile edition', () => {
  let loginPage: LoginPage;
  let profilePage: ProfilePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    profilePage = new ProfilePage(page);

    await loginPage.navigateToAndLogin();
    await profilePage.navigateTo();
  });

  test('should update user profile information', async ({ page }) => {
    await test.step('edit first name', async () => {
      await profilePage.editProfile({
        firstName: 'Roger',
      });

      await expect(
        profilePage.getFirstOrLastNameEditionWarningMessage()
      ).toBeVisible();
      await profilePage.continueAfterWarningModale();
      await expect(
        profilePage.getFirstOrLastNameEditionWarningMessage()
      ).not.toBeVisible();

      await expect(
        profilePage.getAdminEditionWarningMessage()
      ).not.toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    await test.step('edit last name', async () => {
      await profilePage.editProfile({
        lastName: 'Test',
      });

      await expect(
        profilePage.getFirstOrLastNameEditionWarningMessage()
      ).toBeVisible();
      await profilePage.continueAfterWarningModale();
      await expect(
        profilePage.getFirstOrLastNameEditionWarningMessage()
      ).not.toBeVisible();

      await expect(
        profilePage.getAdminEditionWarningMessage()
      ).not.toBeVisible();
    });

    await test.step('edit other properties', async () => {
      await profilePage.editProfile({
        country: 'Germany',
      });

      await expect(
        profilePage.getFirstOrLastNameEditionWarningMessage()
      ).not.toBeVisible();

      await expect(
        profilePage.getAdminEditionWarningMessage()
      ).not.toBeVisible();
    });
  });

  test('should upload profile picture', async ({ page }) => {
    await test.step('upload a picture', async () => {
      await profilePage.uploadProfilePicture(TEST_PICTURE.path);

      await expect(
        page.getByText(TEST_PICTURE.successMessage, { exact: true })
      ).toBeVisible();
    });
  });
});