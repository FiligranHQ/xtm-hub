import { Page } from '@playwright/test';
import { expect } from '../../fixtures/baseFixtures';

export class DashboardDetailPage {
  constructor(private page: Page) {}

  async clickOnDownload() {
    await this.page.getByRole('button', { name: 'Download' }).click();
  }

  async assertCurrentPage(dashboardName: string) {
    await expect(this.page.getByRole('heading', { level: 1 })).toHaveText(
      dashboardName
    );
  }
}
