import { Page } from '@playwright/test';
import { clickRowAction, waitForDrawerToClose } from './common';

export default class ServicePage {
  constructor(private page: Page) {}

  async navigateToServiceListAdmin() {
    await this.page.getByRole('button', { name: 'Settings' }).click();
    await this.page.getByRole('link', { name: 'Services' }).click();
    await this.page.getByText('Name', { exact: true }).click();

    await clickRowAction(
      this.page,
      this.page.getByRole('row', { name: 'Vault' }),
      'Manage',
      'link'
    );
  }

  async addOrganizationIntoService(organizationName: string) {
    await this.page
      .getByRole('button', { name: 'Subscribe organization' })
      .click();
    await this.page.getByLabel('Organization', { exact: true }).click();
    await this.page.getByLabel(organizationName).click();
    await this.page.getByRole('button', { name: 'Validate' }).click();
    await waitForDrawerToClose(this.page);
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
    await waitForDrawerToClose(this.page);
  }

  async addUserIntoService(userEmail: string) {
    await this.page.getByRole('button', { name: 'Invite user' }).click();
    await this.page.getByPlaceholder('EMAIL').click();
    await this.page.getByPlaceholder('EMAIL').fill(userEmail);
    await this.page.getByText(userEmail).click();
    await this.page.getByRole('dialog').nth(1).press('Enter');
    await this.page.getByLabel('Manage access').click();
    await this.page.getByRole('button', { name: 'Validate' }).click();
    await waitForDrawerToClose(this.page);
  }

  async addUserIntoServiceWithCapability(
    userEmail: string,
    capability: string
  ) {
    await this.page.getByRole('button', { name: 'Invite user' }).click();
    await this.page.getByPlaceholder('EMAIL').click();
    await this.page.getByPlaceholder('EMAIL').fill('use');
    await this.page.getByText(userEmail).click();
    await this.page.getByRole('dialog').nth(1).press('Enter');
    await this.page.getByLabel(capability).click();
    await this.page.getByRole('button', { name: 'Validate' }).click();
    await waitForDrawerToClose(this.page);
  }

  async editUsersRightsForService(
    userEmail: string,
    newCapability: string = 'Manage access'
  ) {
    await clickRowAction(
      this.page,
      this.page.getByRole('row', { name: userEmail }),
      'Update'
    );
    await this.page.getByLabel(newCapability).click();
    await this.page.getByRole('button', { name: 'Validate' }).click();
    await waitForDrawerToClose(this.page);
  }

  async deleteOrganizationFromService(organizationName: string = 'Thales') {
    await this.page.waitForTimeout(2000);
    const row = this.page.getByRole('row', { name: organizationName });
    await clickRowAction(this.page, row, 'Delete');
    // Wait for the dialog to appear and animation to finish
    await this.page.getByRole('button', { name: 'Remove access' }).click();
  }
}
