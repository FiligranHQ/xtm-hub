import { test, expect } from '../fixtures/baseFixtures';
import LoginPage from '../model/login.pageModel';
import DashboardListPage, {
  TEST_2_IMAGE_FILE,
  TEST_2_JSON_FILE,
  TEST_3_IMAGE_FILE,
  TEST_JSON_FILE,
} from '../model/dashboard/list.pageModel';
import { waitForDrawerToClose } from '../model/common';
import { HomePage } from '../model/home.pageModel';
import { OCTI_CUSTOM_DASHBOARDS_SERVICE_NAME } from '../db-utils/const';

const DASHBOARD_TEST = {
  name: 'e2e dashboard name',
  shortDescription: 'This is a short description',
  version: '1.0.0',
  description: 'This is a dashboard description markdown',
};

const UPDATED_DASHBOARD_TEST = {
  name: 'e2e updated dashboard name',
  shortDescription: 'This is a short updated description',
  version: '2.0.0',
  description: 'This is a dashboard description markdown updated',
};

test.describe('Custom dashboards management', () => {
  let loginPage: LoginPage;
  let dashboardListPage: DashboardListPage;
  let homePage: HomePage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardListPage = new DashboardListPage(page);
    homePage = new HomePage(page);

    await loginPage.navigateToAndLogin();
    await homePage.subscribeToService(OCTI_CUSTOM_DASHBOARDS_SERVICE_NAME);
    await dashboardListPage.addCustomDashboard(DASHBOARD_TEST);
  });

  test('Should add custom dashboard', async ({ page }) => {
    await dashboardListPage.navigateToDashboardDetail(
      DASHBOARD_TEST.shortDescription
    );
    await expect(
      page.getByRole('heading', { name: DASHBOARD_TEST.name })
    ).toBeVisible();
  });

  test('Should edit a custom dashboard', async ({ page }) => {
    const openUpdateDrawer = async () => {
      await page
        .getByRole('button', { name: 'Open menu', exact: true })
        .click();
      await page.getByRole('button', { name: 'Update' }).click();
    };

    await expect(
      page.getByText(DASHBOARD_TEST.name, { exact: true })
    ).toBeVisible();

    await openUpdateDrawer();

    let test_step = 0;
    await test.step('Update only texts', async () => {
      test_step++;
      await page
        .getByPlaceholder('Dashboard name')
        .fill(`${UPDATED_DASHBOARD_TEST.name} // ${test_step}`);
      await page
        .getByPlaceholder('This is some catchphrases to')
        .fill(UPDATED_DASHBOARD_TEST.shortDescription);
      await page
        .getByRole('textbox', { name: 'OpenCTI version' })
        .fill(UPDATED_DASHBOARD_TEST.version);
      await page
        .getByRole('textbox', { name: 'This is a paragraph to' })
        .fill(UPDATED_DASHBOARD_TEST.description);
      await page.getByLabel('Publish').click();
      await page.getByRole('button', { name: 'Validate' }).click();
      await waitForDrawerToClose(page);
      await expect(
        page.getByText(`${UPDATED_DASHBOARD_TEST.name} // ${test_step}`, {
          exact: true,
        })
      ).toBeVisible();
    });

    await test.step('Add a new one image', async () => {
      test_step++;
      await openUpdateDrawer();
      await page
        .getByPlaceholder('Dashboard name')
        .fill(`${UPDATED_DASHBOARD_TEST.name} // ${test_step}`);
      await dashboardListPage.uploadImageDocument(TEST_2_IMAGE_FILE.path);
      await page.getByRole('button', { name: 'Validate' }).click();
      await waitForDrawerToClose(page);
      await expect(
        page.getByText(`${UPDATED_DASHBOARD_TEST.name} // ${test_step}`, {
          exact: true,
        })
      ).toBeVisible();
      await expect(
        page.locator('[aria-roledescription="carousel"] div button')
      ).toHaveCount(3);
    });

    await test.step('Delete the old image and add a new one', async () => {
      test_step++;
      await openUpdateDrawer();
      await page
        .getByPlaceholder('Dashboard name')
        .fill(`${UPDATED_DASHBOARD_TEST.name} // ${test_step}`);
      await page.getByTestId('images-grid').getByRole('button').first().click();
      await page
        .getByRole('alertdialog', { name: 'Do you want to continue?' })
        .waitFor();
      await page.getByRole('button', { name: 'Continue' }).click();
      await dashboardListPage.uploadImageDocument(TEST_3_IMAGE_FILE.path);

      await page.getByRole('button', { name: 'Validate' }).click();
      await waitForDrawerToClose(page);
      await expect(
        page.getByText(`${UPDATED_DASHBOARD_TEST.name} // ${test_step}`, {
          exact: true,
        })
      ).toBeVisible();
      await expect(
        page.locator('[aria-roledescription="carousel"] div button')
      ).toHaveCount(3);
    });

    await test.step('Delete the old image and add a new one', async () => {
      test_step++;
      await openUpdateDrawer();
      await page
        .getByPlaceholder('Dashboard name')
        .fill(`${UPDATED_DASHBOARD_TEST.name} // ${test_step}`);
      await page.getByTestId('images-grid').getByRole('button').first().click();
      await page
        .getByRole('alertdialog', { name: 'Do you want to continue?' })
        .waitFor();
      await page.getByRole('button', { name: 'Continue' }).click();
      await dashboardListPage.uploadImageDocument(TEST_3_IMAGE_FILE.path);

      await page.getByRole('button', { name: 'Validate' }).click();
      await waitForDrawerToClose(page);
      await expect(
        page.getByText(`${UPDATED_DASHBOARD_TEST.name} // ${test_step}`, {
          exact: true,
        })
      ).toBeVisible();
      await expect(
        page.locator('[aria-roledescription="carousel"] div button')
      ).toHaveCount(3);
    });

    await test.step('Delete the old image and add a new one', async () => {
      test_step++;
      await openUpdateDrawer();
      await page
        .getByPlaceholder('Dashboard name')
        .fill(`${UPDATED_DASHBOARD_TEST.name} // ${test_step}`);
      await page.getByTestId('images-grid').getByRole('button').first().click();
      await page
        .getByRole('alertdialog', { name: 'Do you want to continue?' })
        .waitFor();
      await page.getByRole('button', { name: 'Continue' }).click();
      await dashboardListPage.uploadImageDocument(TEST_3_IMAGE_FILE.path);

      await page.getByRole('button', { name: 'Validate' }).click();
      await waitForDrawerToClose(page);
      await expect(
        page.getByText(`${UPDATED_DASHBOARD_TEST.name} // ${test_step}`, {
          exact: true,
        })
      ).toBeVisible();
      await expect(
        page.locator('[aria-roledescription="carousel"] div button')
      ).toHaveCount(3);
    });

    await test.step('Update the dashboard', async () => {
      test_step++;
      await openUpdateDrawer();
      await page
        .getByPlaceholder('Dashboard name')
        .fill(`${UPDATED_DASHBOARD_TEST.name} // ${test_step}`);

      await page
        .getByText(`Existing JSON file: ${TEST_JSON_FILE.name}`)
        .waitFor();

      await dashboardListPage.uploadJsonDocument(TEST_2_JSON_FILE.path);

      await page.getByRole('button', { name: 'Validate' }).click();
      await waitForDrawerToClose(page);
      await expect(
        page.getByText(`${UPDATED_DASHBOARD_TEST.name} // ${test_step}`, {
          exact: true,
        })
      ).toBeVisible();
      await expect(
        page.locator('[aria-roledescription="carousel"] div button')
      ).toHaveCount(3);
      await openUpdateDrawer();
      await page
        .getByText(`Existing JSON file: ${TEST_2_JSON_FILE.name}`)
        .waitFor();
    });
  });
});
