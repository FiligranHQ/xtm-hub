import { test } from '../../fixtures/baseFixtures';
import { CybersecuritySolutionsPage } from '../../model/cybersecurity-solutions/index.pageModel';
import { PublicOpenCtiCustomDashboardListPage } from '../../model/cybersecurity-solutions/open-cti-custom-dashboards/list.pageModel';
import { PublicOpenCtiCustomDashboardDetailPage } from '../../model/cybersecurity-solutions/open-cti-custom-dashboards/detail.pageModel';
import LoginPage from '../../model/login.pageModel';
import { HomePage } from '../../model/home.pageModel';
import DashboardListPage, {
  TEST_JSON_FILE,
} from '../../model/dashboard/list.pageModel';
import { DashboardDetailPage } from '../../model/dashboard/detail.pageModel';
import { OCTI_CUSTOM_DASHBOARDS_SERVICE_NAME } from '../../db-utils/const';

const DASHBOARD_TEST = {
  name: 'e2e dashboard name',
  slug: 'e2e-dashboard-slug',
  shortDescription: 'E2E Custom dashboard short description',
  version: '1.0.0',
  description: 'This is a dashboard description markdown',
};

test.describe('Public custom dashboard', () => {
  let cyberSecurityPage: CybersecuritySolutionsPage;
  let customDashboardListPage: PublicOpenCtiCustomDashboardListPage;
  let customDashboardDetailPage: PublicOpenCtiCustomDashboardDetailPage;
  let loginPage: LoginPage;
  let homePage: HomePage;
  let dashboardListPage: DashboardListPage;
  let dashboardDetailPage: DashboardDetailPage;

  test.beforeEach(async ({ page }) => {
    cyberSecurityPage = new CybersecuritySolutionsPage(page);
    customDashboardListPage = new PublicOpenCtiCustomDashboardListPage(page);
    customDashboardDetailPage = new PublicOpenCtiCustomDashboardDetailPage(
      page
    );
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    dashboardListPage = new DashboardListPage(page);
    dashboardDetailPage = new DashboardDetailPage(page);

    await loginPage.navigateToAndLogin();
    await homePage.assertCurrentPage();
    await homePage.subscribeToService(OCTI_CUSTOM_DASHBOARDS_SERVICE_NAME);
    await dashboardListPage.addCustomDashboard(DASHBOARD_TEST);
    await loginPage.logout();
    await cyberSecurityPage.assertCurrentPage();
  });

  test('should display service list and details', ({ page }) => {
    test.step('should display custom dashboard service on public pages', async () => {
      await cyberSecurityPage.navigateTo();
      await cyberSecurityPage.hasService(OCTI_CUSTOM_DASHBOARDS_SERVICE_NAME);
    });

    test.step('should navigate to dashboard details', async () => {
      await cyberSecurityPage.clickOnService(
        OCTI_CUSTOM_DASHBOARDS_SERVICE_NAME
      );
      await customDashboardListPage.assertCurrentPage();

      await customDashboardListPage.navigateToDashboardDetail(
        DASHBOARD_TEST.shortDescription
      );

      await customDashboardDetailPage.assertCurrentPage(
        DASHBOARD_TEST.slug,
        DASHBOARD_TEST.name
      );
    });

    test.step('should be redirected to login page on download click', async () => {
      await customDashboardDetailPage.clickOnDownload();
      await loginPage.assertCurrentPage();
    });

    test.step('should be redirected to dashboard page on login', async () => {
      await loginPage.login('admin@thales.com');
      await homePage.assertCurrentPage();

      await homePage.subscribeToService(OCTI_CUSTOM_DASHBOARDS_SERVICE_NAME);

      await homePage.navigateToService(OCTI_CUSTOM_DASHBOARDS_SERVICE_NAME);
      await dashboardListPage.assertCurrentPage();
    });

    test.step('should be able to download a dashboard', async () => {
      await dashboardListPage.navigateToDashboardDetail(
        DASHBOARD_TEST.shortDescription
      );

      await dashboardDetailPage.assertCurrentPage(DASHBOARD_TEST.name);

      await dashboardDetailPage.assertDownload(TEST_JSON_FILE.name);
    });
  });
});
