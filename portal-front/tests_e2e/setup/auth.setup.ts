import { expect, test as setup } from '../fixtures/baseFixtures';
import LoginPage from '../model/login.pageModel';

const authFile = 'tests_e2e/.setup/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Welcome to the portal'
  );
  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
