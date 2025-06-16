import { Page } from '@playwright/test';
import { expect } from '../../fixtures/baseFixtures';

export class DashboardDetailPage {
  constructor(private page: Page) {}

  async assertDownload(fileName: string) {
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByRole('button', { name: 'Download' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(fileName);
  }

  async assertCurrentPage(dashboardName: string) {
    await expect(this.page.getByRole('heading', { level: 1 })).toHaveText(
      dashboardName
    );
  }
}
