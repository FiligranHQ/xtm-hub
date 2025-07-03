import { Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';

export class HomePage {
  constructor(private page: Page) {}

  async navigateTo() {
    await this.page.goto('/app');
  }

  async subscribeToService(name: string) {
    await this.page
      .locator('li')
      .filter({ hasText: name })
      .getByRole('button')
      .click();
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async navigateToService(name: string) {
    await this.page.getByRole('link', { name }).click();
  }

  async assertCurrentPage() {
    await this.page.waitForURL('/app');
    await expect(this.page.getByText('Home')).toBeVisible();
  }
}
