import { expect, test } from '../fixtures/baseFixtures.js';
import LoginPage from '../model/login.pageModel';
import { removeSubscription } from '../db-utils/subscription.helper';
import { removeDocument } from '../db-utils/document.helper';

test('should confirm CRUD of documents is OK', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login();

  // Go to Vault page
  await page
    .locator('li')
    .filter({ hasText: 'VaultThis service allows you' })
    .getByLabel('Subscribe service')
    .click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('link', { name: 'Vault' }).click();
  await expect(
    page.getByRole('heading', { name: 'Partner Vault' })
  ).toBeVisible();

  // Upload file
  await page.getByLabel('Add new document').click();
  await page
    .getByPlaceholder('This is a short paragraph to describe the document.')
    .fill('description');

  const fileInput = await page.locator('input[type="file"]');

  await fileInput.setInputFiles('./tests/tests_files/assets/teste2e.pdf');
  await page.getByRole('button', { name: 'Validate' }).click();

  await expect(page.getByRole('cell', { name: 'teste2e.pdf' })).toBeVisible();

  // Filter ok
  await page.getByPlaceholder('Search with document name...').click();
  await page.getByPlaceholder('Search with document name...').fill('a');

  await expect(
    page.getByRole('cell', { name: 'teste2e.pdf' })
  ).not.toBeVisible();

  // Delete ok
  await page.getByPlaceholder('Search with document name...').click();
  await page.getByPlaceholder('Search with document name...').fill('');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByText('Delete').click();

  await expect(
    page.getByRole('cell', { name: 'teste2e.pdf' })
  ).not.toBeVisible();
});

test.afterAll('Remove newly created subscription', async () => {
  await removeDocument('teste2e.pdf');
  await removeSubscription('e88e8f80-ba9e-480b-ab27-8613a1565eff');
});
