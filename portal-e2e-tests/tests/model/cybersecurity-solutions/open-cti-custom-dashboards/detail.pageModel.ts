import { expect } from '../../../fixtures/baseFixtures';
import { Page } from '@playwright/test';

export class PublicOpenCtiCustomDashboardDetailPage {
  constructor(private page: Page) {}

  async clickOnDownload() {
    await this.page.getByRole('link', { name: 'Download' }).click();
  }

  async assertCurrentPage(slug: string, name: string) {
    await this.page.waitForURL(
      `/cybersecurity-solutions/open-cti-custom-dashboards/${slug}`
    );
    await expect(this.page.getByRole('heading', { level: 1 })).toHaveText(name);
  }
}
