import { Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';

export class CybersecuritySolutionsPage {
  constructor(private page: Page) {}

  async clickOnSignIn() {
    await this.page.getByText('SIGN IN').click();
  }

  async navigateTo() {
    await this.page.goto('/');
  }

  async assertCurrentPage() {
    await this.page.waitForURL('/');
    await expect(
      this.page.getByRole('heading', {
        level: 1,
        name: 'Discover resources and expertise',
      })
    ).toBeVisible();
  }
}
