import { Locator, Page } from '@playwright/test';
import { waitForDrawerToClose, waitForReactIdle } from './common';

const TEST_JSON_FILE = {
  path: './tests/tests_files/assets/octi_csv_feed.json',
  name: 'octi_csv_feed.json',
};
const TEST_IMAGE_FILE = {
  path: './tests/tests_files/assets/test.png',
  name: 'test.png',
};

export default class CsvFeedPage {
  constructor(private page: Page) {}

  async subscribeCsvFeedService() {
    await this.page
      .locator('li')
      .filter({ hasText: 'CSV Feeds Library' })
      .getByRole('button')
      .click();
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }
  async uploadJsonDocument(filePath: string) {
    const fileInput = this.page.locator(
      'input[type="file"][accept="application/json"]'
    );
    await fileInput.setInputFiles(filePath);
  }

  async uploadImageDocument(filePath: string) {
    const fileInput = this.page.locator(
      'input[type="file"][accept="image/jpeg, image/png"]'
    );
    await fileInput.setInputFiles(filePath);
  }

  async fillCsvFeed({
    name,
    shortDescription,
    description,
  }: {
    name: string;
    shortDescription: string;
    description: string;
  }) {
    await this.page.getByLabel('Add new CSV Feed').click();
    await this.page.getByRole('textbox', { name: 'Name *' }).fill(name);
    await this.page
      .getByRole('textbox', { name: 'Short Description *' })
      .fill(shortDescription);
    await this.page
      .getByRole('textbox', { name: 'This is a paragraph to' })
      .fill(description);
    await this.page
      .getByRole('checkbox', { name: 'Is the CSV Feed published?' })
      .click();
    await this.uploadJsonDocument(TEST_JSON_FILE.path);
    await this.uploadImageDocument(TEST_IMAGE_FILE.path);
    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async navigateToCsvFeed(shortDescription: string) {
    await this.page.getByRole('link', { name: shortDescription }).click();
  }

  async deleteCsvFeed() {
    await this.page.getByRole('button', { name: 'Update' }).click();
    await this.page
      .getByRole('button', { name: 'Delete the CSV Feed' })
      .click();
    await this.page.getByRole('button', { name: 'Delete' }).click();

    await waitForDrawerToClose(this.page);
    await this.page.waitForTimeout(3000);
  }
}
