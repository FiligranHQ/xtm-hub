import { test } from '../../fixtures/baseFixtures';
import LoginPage from '../../model/login.pageModel';
import { CybersecuritySolutionsPage } from '../../model/cybersecurity-solutions/index.pageModel';
import { HomePage } from '../../model/home.pageModel';

test.describe('Public redirections', () => {
  let cyberSecurityPage: CybersecuritySolutionsPage;
  let loginPage: LoginPage;
  let homePage: HomePage;

  test.beforeEach(({ page }) => {
    cyberSecurityPage = new CybersecuritySolutionsPage(page);
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
  });

  test('should redirect user between public pages and login page', async ({
    page,
  }) => {
    await test.step('should redirect user to public pages', async () => {
      await homePage.navigateTo();
      await cyberSecurityPage.assertCurrentPage();
    });

    await test.step('should navigate user to login page', async () => {
      await cyberSecurityPage.clickOnSignIn();
      await loginPage.assertCurrentPage();
    });

    await test.step('should log in user and redirect him to home', async () => {
      await loginPage.login();
      await homePage.assertCurrentPage();
    });

    await test.step('should let user see public pages', async () => {
      await cyberSecurityPage.navigateTo();
      await cyberSecurityPage.assertCurrentPage();
    });

    await test.step('should redirect user on home when user is connected and wants to sign in', async () => {
      await cyberSecurityPage.clickOnSignIn();
      await homePage.assertCurrentPage();
    });

    await test.step('should redirect user to public pages when user logs out', async () => {
      await loginPage.logout();
      await cyberSecurityPage.assertCurrentPage();
    });

    await test.step('should navigate user to login page when user clicks on sign in', async () => {
      await cyberSecurityPage.clickOnSignIn();
      await loginPage.assertCurrentPage();
    });
  });
});
