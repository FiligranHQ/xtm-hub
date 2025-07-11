import { expect, test } from '../fixtures/baseFixtures.js';
import LoginPage from '../model/login.pageModel';
import ProfilePage from '../model/profile.pageModel';

test.describe('Profile edition', () => {
  let loginPage: LoginPage;
  let profilePage: ProfilePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    profilePage = new ProfilePage(page);

    await loginPage.navigateToAndLogin();
    await profilePage.navigateTo();
  });

  test('should update user profile information', async () => {
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
        picture:
          'https://upload.wikimedia.org/wikipedia/commons/1/1b/Haricots_verts01.jpg',
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
});
