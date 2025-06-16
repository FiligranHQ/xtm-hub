import { expect } from '../../../fixtures/baseFixtures';
import { Page } from '@playwright/test';
import { OCTI_CUSTOM_DASHBOARDS_SERVICE_NAME } from '../../../db-utils/const';

export class PublicOpenCtiCustomDashboardListPage {
  constructor(private page: Page) {}

  async navigateToDashboardDetail(shortDescription: string) {
    await this.page.getByRole('link', { name: shortDescription }).click();
  }

  async assertCurrentPage() {
    await this.page.waitForURL(
      '/cybersecurity-solutions/open-cti-custom-dashboards'
    );
    await expect(this.page.getByRole('heading', { level: 1 })).toHaveText(
      OCTI_CUSTOM_DASHBOARDS_SERVICE_NAME
    );
  }
}
