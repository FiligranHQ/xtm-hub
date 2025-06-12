import { Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';

export class CybersecuritySolutionsPage {
  constructor(private page: Page) {}

  async clickOnSignIn() {
    await this.page.getByText('SIGN IN').click();
  }

  async navigateTo() {
    await this.page.goto('/cybersecurity-solutions');
  }

  async assertCurrentPage() {
    await this.page.waitForURL('/cybersecurity-solutions');
    await expect(
      this.page.getByText('Discover resources and expertise')
    ).toBeVisible();
  }
}
