import { expect, test } from '../fixtures/baseFixtures.js';
import LoginPage from '../model/login.pageModel';
import { removeDocument } from '../db-utils/document.helper';
import DocumentPage from '../model/document.pageModel';

export const TEST_FILE = {
  path: './tests/tests_files/assets/teste2e-document.pdf',
  name: 'teste2e-document.pdf',
  description: 'Test document description',
};

test.describe('Document Management', () => {
  let loginPage: LoginPage;
  let documentPage: DocumentPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    documentPage = new DocumentPage(page);

    await loginPage.login();

    await documentPage.navigateToVault();
  });

  test('should perform complete CRUD operations on documents', async ({
    page,
  }) => {
    await test.step('Upload new document', async () => {
      await documentPage.uploadDocument(TEST_FILE.path, TEST_FILE.description);
      await expect(
        page.getByRole('cell', { name: TEST_FILE.name })
      ).toBeVisible();
    });

    await test.step('Filter documents', async () => {
      await documentPage.searchDocument('a');
      await expect(
        page.getByRole('cell', { name: TEST_FILE.name })
      ).not.toBeVisible();

      await documentPage.searchDocument('');
      await expect(
        page.getByRole('cell', { name: TEST_FILE.name })
      ).toBeVisible();
    });

    await test.step('Delete document', async () => {
      await documentPage.deleteDocument(TEST_FILE.name);
      await expect(
        page.getByRole('cell', { name: TEST_FILE.name })
      ).not.toBeVisible();
    });
  });
});
