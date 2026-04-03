import { Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';

const TEST_IMAGE_FILE = {
  path: './tests/tests_files/assets/test.png',
  name: 'test.png',
};
export default class XTMSuiteRoadmapPage {
  constructor(private page: Page) {}
  async addEpic({
    title,
    short_description,
    description,
    product = 'OpenCTI',
    timeline = 'Now',
    integration = false,
    draft = true,
  }: {
    title: string;
    short_description: string;
    description: string;
    product?: string;
    timeline?: string;
    integration?: boolean;
    draft?: boolean;
  }) {
    await this.page.getByRole('button', { name: 'Create' }).click();
    await this.page.getByRole('textbox', { name: 'Title' }).fill(title);
    await this.page
      .getByRole('textbox', { name: 'Short description' })
      .fill(short_description);
    await this.page
      .getByRole('textbox', { name: 'This is a paragraph to' })
      .fill(description);
    await this.page.getByRole('combobox', { name: 'Product' }).click();
    await this.page.getByRole('option', { name: product }).click();
    await this.page.getByRole('combobox', { name: 'Timeline' }).click();
    await this.page.getByRole('option', { name: timeline }).click();
    if (!draft) {
      await this.page.getByRole('checkbox', { name: 'Active' }).check();
    }
    if (integration) {
      await this.page
        .getByRole('checkbox', { name: 'Is an integration' })
        .click();
      await this.uploadImageDocument(TEST_IMAGE_FILE.path);
    }
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  async deleteEpic() {
    await this.page
      .getByRole('button', { name: 'Open menu', exact: true })
      .click();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }

  async updateEpic({
    title,
    short_description,
    description,
    product,
    timeline,
    draft,
  }: {
    title?: string;
    short_description?: string;
    description?: string;
    product?: string;
    timeline?: string;
    draft: boolean;
  }) {
    await this.page
      .getByRole('button', { name: 'Open menu', exact: true })
      .click();
    await this.page.getByRole('menuitem', { name: 'Update' }).click();
    if (title)
      await this.page.getByRole('textbox', { name: 'Title' }).fill(title);
    if (short_description)
      await this.page
        .getByRole('textbox', { name: 'Short description' })
        .fill(short_description);
    if (description)
      await this.page
        .getByRole('textbox', { name: 'This is a paragraph to' })
        .fill(description);
    if (product) {
      await this.page.getByRole('combobox', { name: 'Product' }).click();
      await this.page.getByRole('option', { name: product }).click();
    }
    if (timeline) {
      await this.page.getByRole('combobox', { name: 'Timeline' }).click();
      await this.page.getByRole('option', { name: timeline }).click();
    }
    if (!draft) {
      await this.page
        .getByRole('checkbox', {
          name: 'Is this EPIC published? (By default your EPIC is in draft mode)',
        })
        .check();
    }
    if (draft) {
      await this.page
        .getByRole('checkbox', {
          name: 'Is this EPIC published? (By default your EPIC is in draft mode)',
        })
        .uncheck();
    }
    await this.page.getByRole('button', { name: 'Update' }).click();
  }

  async uploadImageDocument(filePath: string) {
    await this.page.locator('input[type="file"]').setInputFiles(filePath);
  }

  async checkFilters({
    openCTINumbers = 0,
    openAEVNumbers = 0,
    openGRCNumbers = 0,
    xtmHubNumbers = 0,
    xtmOneNumbers = 0,
  }: {
    openCTINumbers?: number;
    openAEVNumbers?: number;
    openGRCNumbers?: number;
    xtmHubNumbers?: number;
    xtmOneNumbers?: number;
  }) {
    await expect(
      this.page.getByRole('button', {
        name: `All products (${openCTINumbers + openAEVNumbers + openGRCNumbers + xtmHubNumbers + xtmOneNumbers})`,
      })
    ).toBeVisible();
    await expect(
      this.page.getByRole('button', { name: `OpenCTI (${openCTINumbers})` })
    ).toBeVisible();
    await expect(
      this.page.getByRole('button', { name: `OpenAEV (${openAEVNumbers})` })
    ).toBeVisible();
    await expect(
      this.page.getByRole('button', { name: `OpenGRC (${openGRCNumbers})` })
    ).toBeVisible();
    await expect(
      this.page.getByRole('button', { name: `XTM Hub (${xtmHubNumbers})` })
    ).toBeVisible();
    await expect(
      this.page.getByRole('button', { name: `XTM One (${xtmOneNumbers})` })
    ).toBeVisible();
  }

  async navigateToService() {
    await this.page.getByRole('link', { name: 'Public Roadmap' }).click();
  }
}
