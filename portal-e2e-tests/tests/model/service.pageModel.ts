import { Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';

export default class ServicePage {
  constructor(private page: Page) {}

  async navigateToServiceListAdmin() {
    await this.page.getByRole('button', { name: 'Settings' }).click();
    await this.page.getByRole('link', { name: 'Services' }).click();

    await this.page
      .getByRole('row', { name: 'Vault short description for' })
      .getByRole('button')
      .click();
    await this.page.getByLabel('Admin').click();
  }

  async addOrganizationIntoService(organizationName: string) {
    await this.page
      .getByRole('button', { name: 'Subscribe organization' })
      .click();
    await this.page.getByLabel('Organization', { exact: true }).click();
    await this.page.getByLabel(organizationName).click();
    await this.page.getByRole('button', { name: 'Validate' }).click();
    await this.page
      .getByRole('main')
      .getByText(organizationName, { exact: true })
      .click();
  }

  async addUserIntoService(userEmail: string) {
    await this.page.getByLabel('Invite user').click();
    await this.page.getByPlaceholder('EMAIL').click();
    await this.page.getByPlaceholder('EMAIL').fill('use');
    await this.page.getByText(userEmail).click();
    await this.page.getByRole('dialog').nth(1).press('Enter');
    await this.page
      .locator('div')
      .filter({ hasText: 'Access service' })
      .nth(2)
      .click();
    await this.page.getByLabel('Capabilities').click();
    await this.page
      .getByLabel('Suggestions')
      .getByText('ACCESS_SERVICE')
      .click();
    await this.page
      .locator('div')
      .filter({ hasText: 'Invite user to the serviceSet' })
      .nth(1)
      .click();
    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async editUsersRightsForService(userEmail: string) {
    await this.page
      .getByRole('row', { name: userEmail })
      .getByRole('button')
      .click();
    await this.page.getByLabel('Edit user rights').click();
    await this.page.getByLabel('Capabilities').click();
    await this.page
      .getByLabel('Suggestions')
      .getByText('MANAGE_ACCESS')
      .click();
    await this.page
      .getByLabel('Suggestions')
      .getByText('ACCESS_SERVICE')
      .click();
    await this.page.getByRole('option', { name: 'Close' }).click();
    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async deleteOrganizationFromService() {
    await this.page.getByLabel('Delete Organization from the').click();
    await this.page.getByRole('button', { name: 'Remove' }).click();
  }
}
