import { expect, test } from '../fixtures/baseFixtures.js';
import LoginPage from '../model/login.pageModel';
import ServicePage from '../model/service.pageModel';
export const PICTURE_1_FILE = {
  path: './tests/tests_files/assets/test.png',
  name: 'test.png',
  description: 'Test picture service',
};
export const PICTURE_2_FILE = {
  path: './tests/tests_files/assets/test2.png',
  name: 'test2.png',
  description: 'Test picture service',
};
test.describe('Service Management', () => {
  let loginPage: LoginPage;
  let servicePage: ServicePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    servicePage = new ServicePage(page);

    await loginPage.login();
    await servicePage.navigateToServiceListAdmin();
  });

  test('should be able to add pictures to a service', async ({ page }) => {
    await test.step('Add picture to a service', async () => {
      await servicePage.addPictureService(
        PICTURE_1_FILE.path,
        PICTURE_2_FILE.path
      );
      await expect(
        page.getByText('Pictures updated for service: Filigran Academy').first()
      ).toBeVisible();

      await expect(page.getByText('Success', { exact: true })).toBeVisible();
    });
  });
});
