import { test, expect } from '../fixtures/baseFixtures';
import LoginPage from '../model/login.pageModel';
import IntegrationPage from '../model/integration.pageModel';

const TAXI_FEED_TEST = {
  name: 'e2e TAXII Feed name',
  shortDescription: 'This is a short description',
  description: 'This is a TAXII description markdown',
  taxiiFeedsServiceInstanceId: '0f4aad4b-bdd6-4084-8b1f-82c9c66578cc',
};

test.describe('TAXII Feeds', () => {
  let loginPage: LoginPage;
  let integrationPage: IntegrationPage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    integrationPage = new IntegrationPage(page);

    await loginPage.navigateToAndLogin();
    await integrationPage.subscribeIntegrationsService();
    await integrationPage.fillTaxiiFeed(TAXI_FEED_TEST);
  });

  test('Should add TAXII Feed', async ({ page }) => {
    await expect(page).toHaveScreenshot();
    await integrationPage.navigateToIntegration(
      TAXI_FEED_TEST.shortDescription
    );
    await expect(page).toHaveScreenshot();
    await expect(
      page.getByRole('heading', { name: TAXI_FEED_TEST.name })
    ).toBeVisible();
  });
  test('Should delete TAXII Feed from the list', async ({ page }) => {
    await expect(
      page.getByText(TAXI_FEED_TEST.name, { exact: true })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await integrationPage.deleteTaxiiFeed('menuitem');

    await expect(
      page.getByText(TAXI_FEED_TEST.name, { exact: true })
    ).not.toBeVisible();
  });
  test('Should delete TAXII Feed from the detailed page', async ({ page }) => {
    await integrationPage.navigateToIntegration(
      TAXI_FEED_TEST.shortDescription
    );
    await integrationPage.deleteTaxiiFeed('button');
    await expect(
      page.getByText(TAXI_FEED_TEST.name, { exact: true })
    ).not.toBeVisible();
  });
});
