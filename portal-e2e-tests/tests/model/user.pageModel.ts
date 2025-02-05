import { Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';

export default class UserPage {
  constructor(private page: Page) {}

  async navigateToUserListAdmin() {
    await this.page.getByRole('button', { name: 'Settings' }).click();
    await this.page.getByRole('link', { name: 'Users' }).nth(1).click();

    await expect(this.page.getByRole('heading', { level: 1 })).toContainText(
      'Users'
    );
  }

  async navigateToUserOrgaAdmin() {
    await this.page.getByRole('button', { name: 'Settings' }).click();
    await this.page.getByRole('link', { name: 'Users' }).first().click();

    await expect(this.page.getByRole('heading', { level: 1 })).toContainText(
      'Users'
    );
  }

  async addUser(userEmail: string, userOrganizationName: string) {
    await this.page.getByLabel('Add user').click();
    await this.page.getByPlaceholder('Email', { exact: true }).fill(userEmail);
    await this.page.getByPlaceholder('Email', { exact: true }).press('Tab');
    await this.page.getByLabel('Roles').press('Enter');
    await this.page.getByRole('option', { name: 'USER' }).click();
    await this.page.getByLabel('Organizations').press('Enter');
    await this.page.getByRole('option', { name: userOrganizationName }).click();
    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async editUser(userEmail) {
    await this.page
      .getByRole('row', { name: userEmail })
      .getByRole('button')
      .click();
    await this.page.getByLabel('Details user').click();
    await expect(
      this.page.getByRole('heading', { name: userEmail })
    ).toBeVisible();

    await this.page.getByLabel('Update').click();
    await this.page.getByLabel('Roles').press('Enter');
    await this.page.getByRole('option', { name: 'ADMIN_ORGA' }).click();
    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async deleteUser(userEmail) {
    await this.page.getByLabel('Delete User').click();
    await this.page.getByRole('button', { name: 'Cancel' }).click();
    await expect(
      this.page.getByRole('heading', { name: userEmail })
    ).toBeVisible();
    await this.page.getByLabel('Delete User').click();
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }
}
