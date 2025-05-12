import { expect, test } from '../fixtures/baseFixtures.js';
import LoginPage from '../model/login.pageModel';
import ProfilePage from '../model/profile.pageModel';
import { getUser, updateUser } from '../db-utils/user.helper';

test.describe('Profile edition', () => {
  let loginPage: LoginPage;
  let profilePage: ProfilePage;
  let backupAdminUser;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    profilePage = new ProfilePage(page);
    backupAdminUser = await getUser('admin@filigran.io');

    await loginPage.login();
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

  test.afterEach(async () => {
    const { first_name, last_name, picture, country } = backupAdminUser;
    await updateUser(backupAdminUser.id, {
      first_name,
      last_name,
      picture,
      country,
    });
  });
});
