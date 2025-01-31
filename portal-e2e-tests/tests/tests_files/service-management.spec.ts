import { expect, test } from '../fixtures/baseFixtures.js';
import LoginPage from '../model/login.pageModel';
import { removeSubscription } from '../db-utils/subscription.helper';
import ServicePage from '../model/service.pageModel';

const TEST_SUBSCRIPTION = {
  organizationName: 'Thales',
  organizationId: '681fb117-e2c3-46d3-945a-0e921b5d4b6c',
  adminOrgaEmail: 'admin@thales.com',
  userInOrgaEmail: 'user@thales.com',
};

const GENERIC_CAPABILITY = {
  access: /^ACCESS$/,
  manageAccess: 'MANAGE_ACCESS',
};
test.describe('Service Management', () => {
  let loginPage;
  let servicePage;

  test.beforeEach(async ({ page }) => {
    await removeSubscription(TEST_SUBSCRIPTION.organizationId);

    loginPage = new LoginPage(page);
    servicePage = new ServicePage(page);

    await loginPage.login();
    await servicePage.navigateToServiceListAdmin();
  });

  test('should be able to admin service', async ({ page }) => {
    await test.step("Add orga's sub + admin_orga's access", async () => {
      await servicePage.addOrganizationIntoService(
        TEST_SUBSCRIPTION.organizationName
      );

      await expect(
        page.getByRole('cell', { name: TEST_SUBSCRIPTION.adminOrgaEmail })
      ).toBeVisible();
      await expect(page.getByText(GENERIC_CAPABILITY.access)).toBeVisible();
      await expect(
        page.getByText(GENERIC_CAPABILITY.manageAccess)
      ).toBeVisible();
    });

    await test.step("Add user's rights for service", async () => {
      await servicePage.addUserIntoService(TEST_SUBSCRIPTION.userInOrgaEmail);

      await expect(
        page.getByRole('cell', { name: TEST_SUBSCRIPTION.userInOrgaEmail })
      ).toBeVisible();
      await expect(
        page.getByText(GENERIC_CAPABILITY.access).nth(1)
      ).toBeVisible();
      await expect(
        page.getByText(GENERIC_CAPABILITY.manageAccess).nth(1)
      ).not.toBeVisible();
    });

    await test.step("Edit user's rights for service", async () => {
      await servicePage.editUsersRightsForService(
        TEST_SUBSCRIPTION.userInOrgaEmail
      );
      await expect(
        page.getByText(GENERIC_CAPABILITY.manageAccess).first()
      ).toBeVisible();
      await expect(
        page.getByText(GENERIC_CAPABILITY.access).first()
      ).toBeVisible();
    });

    await test.step('Add user that is not in organization', async () => {
      await page.getByRole('button', { name: 'Invite user' }).click();
      await page.getByPlaceholder('EMAIL').click();
      await page.getByPlaceholder('EMAIL').fill('user15');
      await expect(page.getByText('No results found.')).toBeVisible();
      await page.getByRole('button', { name: 'Cancel' }).click();
    });

    await test.step("Delete an organization's subscription", async () => {
      await servicePage.deleteOrganizationFromService();
      await page
        .getByRole('main')
        .getByText('Filigran', { exact: true })
        .click();
      await expect(
        page.getByRole('option', { name: TEST_SUBSCRIPTION.organizationName })
      ).not.toBeVisible();
    });
  });

  test.afterEach(async ({}) => {
    await removeSubscription(TEST_SUBSCRIPTION.organizationId);
  });
});
