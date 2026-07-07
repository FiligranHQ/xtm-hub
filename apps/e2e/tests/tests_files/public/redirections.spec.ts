import { expect, test } from '../../fixtures/baseFixtures';
import LoginPage from '../../model/login.pageModel';
import { CybersecuritySolutionsPage } from '../../model/cybersecurity-solutions.pageModel';
import { HomePage } from '../../model/home.pageModel';
import UserPage from '../../model/user.pageModel';

test.describe('Public redirections', () => {
  let cyberSecurityPage: CybersecuritySolutionsPage;
  let loginPage: LoginPage;
  let homePage: HomePage;
  let userPage: UserPage;

  test.beforeEach(({ page }) => {
    cyberSecurityPage = new CybersecuritySolutionsPage(page);
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    userPage = new UserPage(page);
  });

  test('should redirect user between public pages and login page', async ({
    page,
  }) => {
    await test.step('should redirect user to login page if unlogged', async () => {
      await homePage.navigateTo();
      await loginPage.assertCurrentPage();
    });

    await test.step('should navigate user to login page from a public page', async () => {
      await cyberSecurityPage.navigateTo();
      await cyberSecurityPage.clickOnSignIn();
      await loginPage.assertCurrentPage();
    });

    await test.step('should navigate user to sign up page from a public page', async () => {
      await cyberSecurityPage.navigateTo();
      await cyberSecurityPage.clickOnSignUp();
      await page.waitForURL('**/sign-up**');
      await expect(page.locator('#hubspot-form')).toBeAttached();
    });

    await test.step('should log in user and redirect him to home', async () => {
      await loginPage.navigateToAndLogin();
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

    await test.step('should redirect to specified page after sign in', async () => {
      await page.goto('/app/manage/user');
      await loginPage.login();
      await userPage.assertCurrentPage();
    });
  });
});
