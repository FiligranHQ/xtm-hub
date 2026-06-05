import { Page } from '@playwright/test';

const TEST_IMAGE_FILE = {
  path: './tests/tests_files/assets/test.png',
  name: 'test.png',
};
export default class XTMPlatformRoadmapPage {
  constructor(private page: Page) {}
  async addEpic({
    title,
    short_description,
    description,
    product = 'OpenCTI',
    timeline = 'Now',
    integration = false,
    draft = true,
    edition_type = 'CE',
  }: {
    title: string;
    short_description: string;
    description: string;
    product?: string;
    timeline?: string;
    integration?: boolean;
    draft?: boolean;
    edition_type?: string;
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
    await this.page
      .getByRole('radio', { name: edition_type, exact: true })
      .click();
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
    edition_type,
  }: {
    title?: string;
    short_description?: string;
    description?: string;
    product?: string;
    timeline?: string;
    draft: boolean;
    edition_type?: string;
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
    if (edition_type) {
      await this.page
        .getByRole('radio', { name: edition_type, exact: true })
        .click();
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

  async navigateToService() {
    const link = this.page.getByRole('link', { name: 'XTM Platform Roadmap' });
    await link.first().scrollIntoViewIfNeeded();
    await link.first().click();
  }
}
