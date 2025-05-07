import { Locator, Page } from '@playwright/test';
const TEST_JSON_FILE = {
  path: './tests/tests_files/assets/octi_dashboard.json',
  name: 'octi_dashboard.json',
};
const TEST_IMAGE_FILE = {
  path: './tests/tests_files/assets/test.png',
  name: 'test.png',
};

export default class DashboardPage {
  constructor(private page: Page) {}

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

  async subscribeDashboardService() {
    await this.page
      .locator('li')
      .filter({ hasText: 'OpenCTI Custom Dashboards' })
      .getByRole('button')
      .click();
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async fillCustomDashboard({
    name,
    shortDescription,
    version,
    description,
  }: {
    name: string;
    shortDescription: string;
    version: string;
    description: string;
  }) {
    await this.page.getByRole('button', { name: 'Add new dashboard' }).click();
    await this.page.getByPlaceholder('Dashboard name').fill(name);
    await this.page
      .getByPlaceholder('This is some catchphrases to')
      .fill(shortDescription);
    await this.page.getByPlaceholder('1.0.0').fill(version);
    await this.page
      .getByRole('textbox', { name: 'This is a paragraph to' })
      .fill(description);
    await this.page.getByLabel('Publish').click();
    await this.uploadJsonDocument(TEST_JSON_FILE.path);
    await this.uploadImageDocument(TEST_IMAGE_FILE.path);
    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async navigateToDashboard(shortDescription: string) {
    await this.page.getByRole('link', { name: shortDescription }).click();
  }

  async navigateToPublicCustomDashboard() {
    await this.page
      .getByRole('link', { name: 'OpenCTI Custom Dashboards' })
      .click();
  }

  async navigateToPublicDashboardDetail(shortDescription: string) {
    await this.page.getByRole('link', { name: shortDescription }).click();
  }
}
