import { Page } from '@playwright/test';
import { GENERIC_CAPABILITY } from '../tests_files/service-management.spec';

export default class ServicePage {
  constructor(private page: Page) {}

  async navigateToServiceListAdmin() {
    await this.page.getByRole('button', { name: 'Settings' }).click();
    await this.page.getByRole('link', { name: 'Services' }).click();
    await this.page.getByText('Name', { exact: true }).click();

    await this.page
      .getByRole('row', { name: 'Vault' })
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
  }
  async addOrganizationIntoServiceWithCapabilities(organizationName: string) {
    await this.page
      .getByRole('button', { name: 'Subscribe organization' })
      .click();
    await this.page.getByLabel('Organization', { exact: true }).click();
    await this.page.getByLabel(organizationName).click();
    await this.page.getByText('DELETE access:').click();
    await this.page.getByLabel('UPLOAD access:').click();
    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async addUserIntoService(userEmail: string) {
    await this.page.getByLabel('Invite user').click();
    await this.page.getByPlaceholder('EMAIL').click();
    await this.page.getByPlaceholder('EMAIL').fill(userEmail);
    await this.page.getByText(userEmail).click();
    await this.page.getByRole('dialog').nth(1).press('Enter');
    await this.page.getByLabel('Manage access').click();

    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async addUserIntoServiceWithCapability(
    userEmail: string,
    capability: string
  ) {
    await this.page.getByLabel('Invite user').click();
    await this.page.getByPlaceholder('EMAIL').click();
    await this.page.getByPlaceholder('EMAIL').fill('use');
    await this.page.getByText(userEmail).click();
    await this.page.getByRole('dialog').nth(1).press('Enter');
    await this.page.getByLabel(capability).click();

    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async editUsersRightsForService(
    userEmail: string,
    newCapability: string = 'Manage access'
  ) {
    await this.page
      .getByRole('row', { name: userEmail })
      .getByRole('button')
      .first()
      .click();
    await this.page.getByLabel('Edit user rights').click();
    await this.page.getByLabel(newCapability).click();
    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async deleteOrganizationFromService(organizationName: string = 'Thales') {
    await this.page
      .getByRole('row', { name: organizationName })
      .getByRole('button')
      .click();
    await this.page.getByRole('button', { name: 'Delete' }).click();
    await this.page.getByRole('button', { name: 'Remove access' }).click();
  }
}
