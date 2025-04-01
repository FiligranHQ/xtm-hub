import { test, expect } from '../fixtures/baseFixtures';
import LoginPage from '../model/login.pageModel';
import DashboardPage from '../model/dashboard.pageModel';

const DASHBOARD_TEST = {
  name: 'e2e dashboard name',
  shortDescription: 'This is a short description',
  version: '1.0.0',
  description: 'This is a dashboard description markdown',
};

test.describe.serial('Custom dashboard', () => {
  let loginPage;
  let dashboardPage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    await loginPage.login();
  });

  test('Should add custom dashboard', async ({ page }) => {
    await dashboardPage.subscribeDashboardService();
    await dashboardPage.fillCustomDashboard(DASHBOARD_TEST);
    await dashboardPage.navigateToDashboard(DASHBOARD_TEST.shortDescription);
    await expect(
      page.getByRole('heading', { name: DASHBOARD_TEST.name })
    ).toBeVisible();
    // await expect(page).toHaveScreenshot();
  });

  test('Should see the custom dashboard', async ({ page }) => {
    await page.goto('/cybersecurity-solutions');
    await dashboardPage.navigateToPublicCustomDashboard();
    // await expect(page).toHaveScreenshot();
    await dashboardPage.navigateToPublicDashboardDetail();
    // await expect(page).toHaveScreenshot();
  });
});
