import { Locator, Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';

export default class DocumentPage {
  constructor(private page: Page) {}

  async navigateToVault() {
    await this.page.getByRole('link', { name: 'Vault' }).first().click();
    await expect(
      this.page.getByRole('heading', { name: 'Partner Vault' })
    ).toBeVisible();
  }

  async uploadDocument(filePath: string, fileDescription: string) {
    await this.page.getByLabel('Add new document').click();
    await this.page
      .getByPlaceholder('This is a short paragraph to describe the document.')
      .fill(fileDescription);

    const fileInput = await this.page.locator('input[type="file"]');

    await fileInput.setInputFiles(filePath);
    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async searchDocument(searchLabel: string) {
    await this.page.getByPlaceholder('Search with document name...').click();
    await this.page
      .getByPlaceholder('Search with document name...')
      .fill(searchLabel);
  }

  async deleteDocument(documentName: string) {
    const documentRow = await this.getDocumentRow(documentName);
    await documentRow.getByRole('cell', { name: 'Open menu' }).click();
    await this.page.getByText('Delete').click();
  }

  async getDocumentRow(documentName) {
    const documentCell = await this.getDocumentByName(documentName);
    return documentCell.locator('xpath=ancestor::tr');
  }

  getDocumentByName(documentName) {
    return this.page.getByRole('cell', { name: documentName });
  }
}
