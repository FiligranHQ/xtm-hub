import { Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';

export class HomePage {
  constructor(private page: Page) {}

  async navigateTo() {
    await this.page.goto('/');
  }

  async assertCurrentPage() {
    await this.page.waitForURL('/');
    await expect(this.page.getByText('Home')).toBeVisible();
  }
}
