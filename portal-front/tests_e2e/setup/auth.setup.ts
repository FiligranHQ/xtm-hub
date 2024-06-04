import * as fs from 'fs';
import { expect, test as setup } from '../fixtures/baseFixtures';
import LoginPage from '../model/login.pageModel';

const authFile = 'tests_e2e/.setup/.auth/user.json';

let authSessionStorage: { cookies: { expires: number }[] };
try {
  // For quicker local testing, don't redo the auth if the seed is still valid
  authSessionStorage = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
} catch (e) {
  // eslint-disable-next-line no-console
  console.log('Initialing auth setup');
}

setup('authenticate', async ({ page }) => {
  if ((authSessionStorage?.cookies?.[0]?.expires ?? 0) > Date.now() / 1000) {
    return;
  }
  const loginPage = new LoginPage(page);
  await loginPage.login();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Portal admin@filigran.io'
  );
  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
