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
          name: "You're about to connect your OpenAEV product to XTM Hub",
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
      await page.getByRole('button', { name: 'Connect' }).click();
      await expect(
        page.getByRole('heading', {
          name: 'OpenAEV product connected successfully',
        })
      ).toBeVisible();
    });
    await test.step('instance should be visible', async () => {
      const homePage = new HomePage(page);

      await homePage.navigateTo();
      await waitForReactIdle(page);
      await page.getByRole('button', { name: 'OpenAEV' }).click();
      await page.getByRole('button', { name: 'My product' }).click();
      await expect(
        page.getByRole('link', { name: 'Open AEV Instance', exact: true })
      ).toBeVisible();
    });
  });

  test('should register openCTI platform', async ({ page }) => {
    await test.step('display register page', async () => {
      registerPage = new RegisterPage(page);
      await registerPage.navigateTo('register-opencti', OPENCTI_PLATFORM_URL);
      await expect(
        page.getByRole('heading', {
          name: "You're about to connect your OpenCTI product to XTM Hub",
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
      await page.getByRole('button', { name: 'Connect' }).click();
      await expect(
        page.getByRole('heading', {
          name: 'OpenCTI product connected successfully',
        })
      ).toBeVisible();
    });
    await test.step('instance should be visible', async () => {
      const homePage = new HomePage(page);

      await homePage.navigateTo();
      await waitForReactIdle(page);
      await page.getByRole('button', { name: 'OpenCTI' }).click();
      await page.getByRole('button', { name: 'My product' }).click();
      await expect(
        page.getByRole('link', { name: 'Open CTI Instance', exact: true })
      ).toBeVisible();
    });
  });
});
