import { Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';

export default class UserPage {
  constructor(private page: Page) {}

  async navigateToUserListAdmin() {
    await this.page.getByRole('button', { name: 'Settings' }).click();
    await this.page.getByRole('link', { name: 'Security' }).first().click();

    await expect(this.page.getByRole('heading', { level: 1 })).toContainText(
      'Security'
    );
  }

  async navigateToUserManageAccess() {
    await this.page.getByRole('button', { name: 'Settings' }).click();
    await this.page.getByRole('link', { name: 'Users' }).click();

    await expect(this.page.getByRole('heading', { level: 1 })).toContainText(
      'Security'
    );
  }

  async addUser(userEmail: string, userOrganizationName: string) {
    await this.page.getByRole('button', { name: 'Add user' }).click();
    await this.page.getByPlaceholder('Email', { exact: true }).fill(userEmail);
    await this.page.getByPlaceholder('Email', { exact: true }).press('Tab');
    await this.page.getByRole('combobox').click();
    await this.page.getByRole('option', { name: userOrganizationName }).click();
    await this.page
      .getByRole('button', { name: 'Additional capabilities' })
      .click();
    await this.page.getByRole('option', { name: 'MANAGE ACCESS' }).click();
    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async editUser(userEmail) {
    await this.page.getByRole('cell', { name: userEmail }).click();
    await expect(
      this.page.getByRole('heading', { name: userEmail })
    ).toBeVisible();

    await this.page.getByLabel('Update').click();
    await this.page.getByPlaceholder('First name').fill('test e2e');
    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async disableUser(userEmail) {
    await this.page.getByRole('cell', { name: userEmail }).click();
    await this.page.getByRole('button', { name: 'Disable' }).click();
    await this.page.getByRole('button', { name: 'Cancel' }).click();
    await expect(
      this.page.getByRole('heading', { name: userEmail })
    ).toBeVisible();
    await this.page.getByRole('button', { name: 'Disable' }).click();
    await this.page.getByRole('button', { name: 'Disable' }).click();
  }
}
