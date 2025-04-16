import { Page } from '@playwright/test';
import { clickRowAction } from './common';

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
    await this.page.getByRole('button', { name: 'Manage' }).click();
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
    await this.page.getByText('DELETE access:', { exact: true }).click();
    await this.page.getByLabel('UPLOAD access:', { exact: true }).click();
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
    await clickRowAction(
      this.page,
      this.page.getByRole('row', { name: userEmail }),
      'Edit user rights'
    );
    await this.page.getByLabel(newCapability).click();
    await this.page.getByRole('button', { name: 'Validate' }).click();
    // Wait for dialog to close
    await this.page.waitForSelector('div[role="dialog"]', { state: 'hidden' });
    // Dirty fix: make sure the dropdown is closed
    await this.page.click('body', { position: { x: 1, y: 1 }, force: true });
  }

  async deleteOrganizationFromService(organizationName: string = 'Thales') {
    const row = this.page.getByRole('row', { name: organizationName });
    await clickRowAction(this.page, row, 'Delete');
    await this.page.getByRole('button', { name: 'Remove access' }).click();
  }
}
