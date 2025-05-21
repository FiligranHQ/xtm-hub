import { test, expect } from '../fixtures/baseFixtures';
import LoginPage from '../model/login.pageModel';
import DashboardPage, {
  SERVICE_NAME,
  TEST_2_IMAGE_FILE,
  TEST_2_JSON_FILE,
  TEST_3_IMAGE_FILE,
  TEST_IMAGE_FILE,
  TEST_JSON_FILE,
} from '../model/dashboard.pageModel';
import { removeSubscriptionFromService } from '../db-utils/subscription.helper';
import { PLATFORM_ORGANIZATION_UUID } from '../db-utils/const';
import { removeDocument } from '../db-utils/document.helper';
import { getServiceInstanceByName } from '../db-utils/service.helper';
import { waitForDrawerToClose } from '../model/common';

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

test.describe('Custom dashboards', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    await loginPage.login();
    await dashboardPage.subscribeDashboardService();
    await dashboardPage.addCustomDashboard(DASHBOARD_TEST);
  });

  test.afterEach(async () => {
    const serviceInstance = await getServiceInstanceByName(SERVICE_NAME);
    await removeSubscriptionFromService({
      organizationId: PLATFORM_ORGANIZATION_UUID,
      serviceInstanceId: serviceInstance.id,
    });
    await removeDocument('test.png');
    await removeDocument('test2.png');
    await removeDocument('test3.png');
    await removeDocument('octi_dashboard.json');
    await removeDocument('octi_dashboard_2.json');
  });

  test('Should add custom dashboard', async ({ page }) => {
    await dashboardPage.navigateToDashboard(DASHBOARD_TEST.shortDescription);
    await expect(
      page.getByRole('heading', { name: DASHBOARD_TEST.name })
    ).toBeVisible();
  });

  test('Should see the custom dashboard on public page', async ({ page }) => {
    await page.goto('/cybersecurity-solutions');
    await dashboardPage.navigateToPublicCustomDashboard();
    await dashboardPage.navigateToPublicDashboardDetail(
      DASHBOARD_TEST.shortDescription
    );
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

    // 1. Update only texts
    let test = 1;
    await page
      .getByPlaceholder('Dashboard name')
      .fill(`${UPDATED_DASHBOARD_TEST.name} // ${test}`);
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
      page.getByText(`${UPDATED_DASHBOARD_TEST.name} // ${test}`, {
        exact: true,
      })
    ).toBeVisible();

    // 2. Add a new one image
    test++;
    await openUpdateDrawer();
    await page
      .getByPlaceholder('Dashboard name')
      .fill(`${UPDATED_DASHBOARD_TEST.name} // ${test}`);
    await dashboardPage.uploadImageDocument(TEST_2_IMAGE_FILE.path);
    await page.getByRole('button', { name: 'Validate' }).click();
    await waitForDrawerToClose(page);
    await expect(
      page.getByText(`${UPDATED_DASHBOARD_TEST.name} // ${test}`, {
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page.locator('[aria-roledescription="carousel"] div button')
    ).toHaveCount(3);

    // 2. Delete the old image and add a new one
    test++;
    await openUpdateDrawer();
    await page
      .getByPlaceholder('Dashboard name')
      .fill(`${UPDATED_DASHBOARD_TEST.name} // ${test}`);
    await page.locator('.images-grid .btn-delete').first().click();
    await page
      .getByRole('alertdialog', { name: 'Do you want to continue?' })
      .waitFor();
    await page.getByRole('button', { name: 'Continue' }).click();
    await dashboardPage.uploadImageDocument(TEST_3_IMAGE_FILE.path);

    await page.getByRole('button', { name: 'Validate' }).click();
    await waitForDrawerToClose(page);
    await expect(
      page.getByText(`${UPDATED_DASHBOARD_TEST.name} // ${test}`, {
        exact: true,
      })
    ).toBeVisible();
    await expect(
      page.locator('[aria-roledescription="carousel"] div button')
    ).toHaveCount(3);

    // 3. Update the dashboard
    test++;
    await openUpdateDrawer();
    await page
      .getByPlaceholder('Dashboard name')
      .fill(`${UPDATED_DASHBOARD_TEST.name} // ${test}`);

    await page
      .getByText(`Existing JSON file: ${TEST_JSON_FILE.name}`)
      .waitFor();

    await dashboardPage.uploadJsonDocument(TEST_2_JSON_FILE.path);

    await page.getByRole('button', { name: 'Validate' }).click();
    await waitForDrawerToClose(page);
    await expect(
      page.getByText(`${UPDATED_DASHBOARD_TEST.name} // ${test}`, {
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
