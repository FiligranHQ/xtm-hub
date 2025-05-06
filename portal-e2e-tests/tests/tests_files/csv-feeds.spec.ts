import { test, expect } from '../fixtures/baseFixtures';
import LoginPage from '../model/login.pageModel';
import CsvFeedPage from '../model/csvFeed.pageModel';
import { removeSubscription } from '../db-utils/subscription.helper';
import { removeDocument } from '../db-utils/document.helper';
import { PLATFORM_ORGANIZATION_UUID } from '../db-utils/const';
import { waitForDrawerToClose, waitForToasterToHide } from '../model/common';

const CSV_FEED_TEST = {
  name: 'e2e CSV Feed name',
  shortDescription: 'This is a short description',
  description: 'This is a CSV description markdown',
};

test.describe('CSV Feeds', () => {
  let loginPage: LoginPage;
  let csvFeedPage: CsvFeedPage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    csvFeedPage = new CsvFeedPage(page);

    await loginPage.login();
    await csvFeedPage.subscribeCsvFeedService();
    await csvFeedPage.fillCsvFeed(CSV_FEED_TEST);
  });

  test('Should add CSV Feed', async ({ page }) => {
    await csvFeedPage.navigateToCsvFeed(CSV_FEED_TEST.shortDescription);
    await expect(
      page.getByRole('heading', { name: CSV_FEED_TEST.name })
    ).toBeVisible();
  });
  test('Should delete CSV Feed from the list', async ({ page }) => {
    await expect(
      page.getByText(CSV_FEED_TEST.name, { exact: true })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await csvFeedPage.deleteCsvFeed();

    await expect(
      page.getByText(CSV_FEED_TEST.name, { exact: true })
    ).not.toBeVisible();
  });
  test('Should delete CSV Feed from the detailed page', async ({ page }) => {
    await csvFeedPage.navigateToCsvFeed(CSV_FEED_TEST.shortDescription);
    await csvFeedPage.deleteCsvFeed();
    await expect(
      page.getByText(CSV_FEED_TEST.name, { exact: true })
    ).not.toBeVisible();
  });

  test.afterEach(async () => {
    await removeSubscription(PLATFORM_ORGANIZATION_UUID);
    await removeDocument('test.png');
    await removeDocument('octi_csv_feed.json');
  });
});
