import { Locator, Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';
import { clickRowAction, openAndGetRowActionsDropdown } from './common';

export default class DocumentPage {
  constructor(private page: Page) {}

  async navigateToVault() {
    await this.page.getByRole('link', { name: 'Vault' }).click();

    await expect(
      this.page.getByRole('heading', { name: 'Vault' })
    ).toBeVisible();
  }

  async uploadDocument(filePath: string, fileDescription: string) {
    await this.page.getByLabel('Add new document').click();
    await this.page
      .getByPlaceholder('This is a short paragraph to describe the document.')
      .fill(fileDescription);

    const fileInput = this.page.locator('input[type="file"]');

    await fileInput.setInputFiles(filePath);
    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async editDocument(newDescription: string) {
    await this.page.pause();
    await openAndGetRowActionsDropdown(this.page, this.page.getByRole('row'));
    await this.page.getByRole('cell', { name: 'Open menu' }).first().click();
    await expect(this.page.getByLabel('Delete document')).not.toBeVisible();
    await this.page.getByLabel('Update document').click();
    await this.page
      .getByRole('textbox', { name: 'Description' })
      .fill(newDescription);
    await this.page.getByRole('button', { name: 'Validate' }).click();
    await expect(
      this.page.getByRole('cell', { name: newDescription })
    ).toBeVisible();
  }

  async searchDocument(searchLabel: string) {
    await this.page.getByPlaceholder('Search with document name...').click();
    await this.page
      .getByPlaceholder('Search with document name...')
      .fill(searchLabel);
  }

  async deleteDocument(documentName: string) {
    const documentRow = await this.getDocumentRow(documentName);
    const dropdown = await openAndGetRowActionsDropdown(this.page, documentRow);
    const deleteButton = dropdown.getByText('Delete');
    await deleteButton.click();
  }

  async getDocumentRow(documentName) {
    const documentCell = await this.getDocumentByName(documentName);
    return documentCell.locator('xpath=ancestor::tr');
  }

  getDocumentByName(documentName) {
    return this.page.getByRole('cell', { name: documentName });
  }
}
