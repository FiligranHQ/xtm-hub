import { expect, test } from '../fixtures/baseFixtures.js';
import LoginPage from '../model/login.pageModel';
import ProfilePage from '../model/profile.pageModel';
import { generateUser } from '../db-utils/user.helper';

test.describe('Profile edition', () => {
  const originalFirstName = 'Original first name';
  const originalLastName = 'Original last name';
  let loginPage: LoginPage;
  let profilePage: ProfilePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    profilePage = new ProfilePage(page);
    const { email } = await generateUser({
      firstName: originalFirstName,
      lastName: originalLastName,
    });

    await loginPage.login(email);
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
