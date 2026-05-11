import { Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';

export class HomePage {
  constructor(private page: Page) {}

  async navigateTo() {
    await this.page.goto('/app');
  }

  async assertCurrentPage() {
    await this.page.waitForURL('/app');
    await expect(this.page.getByText('Home')).toBeVisible();
  }
}
