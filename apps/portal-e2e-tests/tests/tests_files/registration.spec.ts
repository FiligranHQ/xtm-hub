import { expect, test } from '../fixtures/baseFixtures';
import LoginPage from '../model/login.pageModel';
import RegisterPage from '../model/register.pageModel';
import { HomePage } from '../model/home.pageModel';
import { waitForReactIdle } from '../model/common';
import { SERVICE_NAME } from '../model/dashboard.pageModel';

const OPENAEV_PLATFORM_URL = {
  url: 'http://localhost:3000',
  title: 'Open%20AEV%20Instance',
  id: '916121bf-d246-4a43-8522-24be19537b91',
  contract: 'EE',
};

const OPENCTI_PLATFORM_URL = {
  url: 'http://localhost:3000',
  title: 'Open%20CTI%20Instance',
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
      await registerPage.navigateTo(
        'register-openaev',
        OPENAEV_PLATFORM_URL.url,
        OPENAEV_PLATFORM_URL.title,
        OPENAEV_PLATFORM_URL.id,
        OPENAEV_PLATFORM_URL.contract
      );
      await expect(
        page.getByRole('heading', {
          name: "You're about to register your OpenAEV platform into XTM Hub",
        })
      ).toBeVisible();
      await expect(
        page.getByRole('radio', { name: 'Filigran', exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('radio', { name: 'admin@filigran.io', exact: true })
      ).toBeVisible();
    });
    await test.step('register platform', async () => {
      await page.getByRole('button', { name: 'Register' }).click();
      await expect(
        page.getByRole('heading', {
          name: 'OpenAEV platform registered successfully',
        })
      ).toBeVisible();
    });
  });

  test('should register openCTI platform', async ({ page }) => {
    await test.step('display register page', async () => {
      registerPage = new RegisterPage(page);
      await registerPage.navigateTo(
        'register-opencti',
        OPENCTI_PLATFORM_URL.url,
        OPENCTI_PLATFORM_URL.title,
        OPENCTI_PLATFORM_URL.id,
        OPENCTI_PLATFORM_URL.contract
      );
      await expect(
        page.getByRole('heading', {
          name: "You're about to register your OpenCTI platform into XTM Hub",
        })
      ).toBeVisible();
      await expect(
        page.getByRole('radio', { name: 'Filigran', exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('radio', { name: 'admin@filigran.io', exact: true })
      ).toBeVisible();
    });
    await test.step('register platform', async () => {
      await page.getByRole('button', { name: 'Register' }).click();
      await expect(
        page.getByRole('heading', {
          name: 'OpenCTI platform registered successfully',
        })
      ).toBeVisible();
    });
    await test.step('instance should be visible', async () => {
      const homePage = new HomePage(page);

      await homePage.navigateTo();
      await waitForReactIdle(page);
      await expect(
        page
          .locator('li')
          .filter({ hasText: 'Open CTI Instance - Private platform' })
      ).toBeVisible();
    });
  });
});
