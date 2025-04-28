import { expect, test } from '../fixtures/baseFixtures.js';
import LoginPage from '../model/login.pageModel';
import DocumentPage from '../model/document.pageModel';
import {
  addServiceCapability,
  deleteServiceCapability,
} from '../db-utils/service.helper';
import ServicePage from '../model/service.pageModel';
import {
  addDocumentInVault,
  removeDocument,
} from '../db-utils/document.helper';
import { removeSubscription } from '../db-utils/subscription.helper';
import { clickRowAction } from '../model/common.js';

const TEST_FILE = {
  path: './tests/tests_files/assets/teste2e.pdf',
  name: 'teste2e.pdf',
  description: 'Test document description',
};

const SERVICE_CAPABILITY = {
  idUpload: '5b08530f-9112-4de7-be13-7a74d76f3ead',
  idDelete: 'df8a6142-153a-42a5-9325-baef5d212044',
  nameUpload: 'UPLOAD',
  nameDelete: 'DELETE',
};

const TEST_CAPABILITY = {
  vaultServiceDefId: '2634d52b-f061-4ebc-bed2-c6cc94297ad1',
  adminThalesEmail: 'admin@thales.com',
  userThalesEmail: 'user@thales.com',
  thalesOrgaId: '681fb117-e2c3-46d3-945a-0e921b5d4b6c',
  organizationName: 'Thales',
};
test.describe('Capabilities', () => {
  let loginPage: LoginPage;
  let documentPage: DocumentPage;
  let servicePage: ServicePage;

  test.beforeEach(async ({ page }) => {
    await addServiceCapability({
      id: SERVICE_CAPABILITY.idUpload,
      name: SERVICE_CAPABILITY.nameUpload,
      service_definition_id: TEST_CAPABILITY.vaultServiceDefId,
    });
    await addServiceCapability({
      id: SERVICE_CAPABILITY.idDelete,
      name: SERVICE_CAPABILITY.nameDelete,
      service_definition_id: TEST_CAPABILITY.vaultServiceDefId,
    });
    await addDocumentInVault({
      id: '312a4ce7-cac6-4d98-a8b2-2351dbc23bf5',
      uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      service_instance_id: 'e88e8f80-ba9e-480b-ab27-8613a1565eff',
      description: 'description',
      file_name: 'fileName.pdf',
      minio_name: 'fileName',
      active: true,
    });

    loginPage = new LoginPage(page);
    documentPage = new DocumentPage(page);
    servicePage = new ServicePage(page);

    await loginPage.login();
  });
  test('Should add subscription with capabilities', async ({ page }) => {
    await test.step("Add orga's sub + user with manage access", async () => {
      await servicePage.navigateToServiceListAdmin();

      await servicePage.addOrganizationIntoServiceWithCapabilities(
        TEST_CAPABILITY.organizationName
      );

      await clickRowAction(
        page,
        page.getByRole('row', {
          name: `${TEST_CAPABILITY.organizationName} DELETE UPLOAD Open menu`,
        }),
        'Manage users',
        'link'
      );
      await servicePage.addUserIntoService(TEST_CAPABILITY.adminThalesEmail);

      await loginPage.logout();
    });
    await test.step('Add simple user access + upload capa', async () => {
      await loginPage.login(TEST_CAPABILITY.adminThalesEmail);

      await documentPage.navigateToVault();

      await page.getByRole('link', { name: 'Manage Vault' }).click();

      await servicePage.addUserIntoServiceWithCapability(
        TEST_CAPABILITY.userThalesEmail,
        'UPLOAD access:'
      );
      await loginPage.logout();
    });

    await test.step('Simple user upload new doc', async () => {
      await loginPage.login(TEST_CAPABILITY.userThalesEmail);
      await documentPage.navigateToVault();
      // Upload new document
      await documentPage.uploadDocument(TEST_FILE.path, TEST_FILE.description);
      await expect(
        page.getByRole('cell', { name: TEST_FILE.name })
      ).toBeVisible();
    });
    await test.step('Simple user edit document', async () => {
      await documentPage.editDocument('DescriptionModified');

      await loginPage.logout();
    });

    await test.step('Admin user change simple user capa to delete', async () => {
      await loginPage.login(TEST_CAPABILITY.adminThalesEmail);
      await documentPage.navigateToVault();
      await page.getByRole('link', { name: 'Manage vault' }).click();

      await servicePage.editUsersRightsForService(
        TEST_CAPABILITY.userThalesEmail,
        'DELETE access:'
      );
      await loginPage.logout();
    });
    await test.step('Simple user can delete document', async () => {
      await loginPage.login(TEST_CAPABILITY.userThalesEmail);
      await documentPage.navigateToVault();

      await documentPage.deleteDocument(TEST_FILE.name);
      await expect(
        page.getByRole('cell', { name: TEST_FILE.name })
      ).not.toBeVisible();
    });
  });
  test.afterEach(async () => {
    await removeSubscription(TEST_CAPABILITY.thalesOrgaId);
    await deleteServiceCapability(SERVICE_CAPABILITY.idDelete);
    await deleteServiceCapability(SERVICE_CAPABILITY.idUpload);
    await removeDocument(TEST_FILE.name);
    await removeDocument('fileName.pdf');
  });
});
