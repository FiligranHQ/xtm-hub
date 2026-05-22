import { expect, test } from '../fixtures/baseFixtures';
import LoginPage from '../model/login.pageModel';
import RegisterPage, { PlatformDetails } from '../model/register.pageModel';
import { HomePage } from '../model/home.pageModel';
import { waitForReactIdle } from '../model/common';

const OPENAEV_PLATFORM_URL: PlatformDetails = {
  url: 'http://localhost:3000',
  title: 'Open AEV Instance',
  id: '916121bf-d246-4a43-8522-24be19537b91',
  contract: 'EE',
  version: '1.0.0',
};

const OPENCTI_PLATFORM_URL: PlatformDetails = {
  url: 'http://localhost:3000',
  title: 'Open CTI Instance',
  id: '916121bf-d246-4a43-8522-24be19537b91',
  contract: 'EE',
};

test.describe('Registration', () => {
  let loginPage: LoginPage;
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToAndLogin();
    await page.waitForURL('/app');
  });

  test('should register openAEV platform', async ({ page }) => {
    await test.step('display register page', async () => {
      registerPage = new RegisterPage(page);
      await registerPage.navigateTo('register-openaev', OPENAEV_PLATFORM_URL);
      await expect(
        page.getByRole('heading', {
          name: "You're about to register your OpenAEV platform into XTM Hub",
        })
      ).toBeVisible();
      await expect(
        page.getByRole('radio', {
          name: 'Filigran (Organizational workspace) - Recommended',
          exact: true,
        })
      ).toBeVisible();
      await expect(
        page.getByRole('radio', {
          name: 'admin@filigran.io (Personal workspace)',
          exact: true,
        })
      ).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
    await test.step('register platform', async () => {
      await page.getByRole('button', { name: 'Register' }).click();
      await expect(
        page.getByRole('heading', {
          name: 'OpenAEV platform registered successfully',
        })
      ).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
    await test.step('instance should be visible', async () => {
      const homePage = new HomePage(page);

      await homePage.navigateTo();
      await waitForReactIdle(page);
      await expect(
        page.locator('li').filter({ hasText: 'Open AEV Instance' })
      ).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test('should register openCTI platform', async ({ page }) => {
    await test.step('display register page', async () => {
      registerPage = new RegisterPage(page);
      await registerPage.navigateTo('register-opencti', OPENCTI_PLATFORM_URL);
      await expect(
        page.getByRole('heading', {
          name: "You're about to register your OpenCTI platform into XTM Hub",
        })
      ).toBeVisible();
      await expect(
        page.getByRole('radio', {
          name: 'Filigran (Organizational workspace) - Recommended',
          exact: true,
        })
      ).toBeVisible();
      await expect(
        page.getByRole('radio', {
          name: 'admin@filigran.io (Personal workspace)',
          exact: true,
        })
      ).toBeVisible();
    });
    await test.step('register platform', async () => {
      await page.getByRole('button', { name: 'Register' }).click();
      await expect(
        page.getByRole('heading', {
          name: 'OpenCTI platform registered successfully',
        })
      ).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
    await test.step('instance should be visible', async () => {
      const homePage = new HomePage(page);

      await homePage.navigateTo();
      await waitForReactIdle(page);
      await expect(
        page.locator('li').filter({ hasText: 'Open CTI Instance' })
      ).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });
});
