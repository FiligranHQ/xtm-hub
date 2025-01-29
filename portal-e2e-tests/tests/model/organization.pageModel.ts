import { Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';

export default class OrganizationPage {
  constructor(private page: Page) {}

  async navigateToOrgaAdmin() {
    await this.page.getByRole('button', { name: 'Settings' }).click();
    await expect(
      this.page.getByRole('link', { name: 'Organizations' })
    ).toBeVisible();
    await this.page.getByText('Organizations').click();
    await expect(this.page.getByRole('heading', { level: 1 })).toContainText(
      'Organizations'
    );
  }

  async createOrganization(
    organizationName: string,
    organizationDomain: string
  ) {
    await this.page.getByLabel('Create Organization').click();
    await this.page.getByPlaceholder('Name').fill(organizationName);
    await this.page.getByPlaceholder('Add a domain').click();
    await this.page.getByPlaceholder('Add a domain').fill(organizationDomain);
    await this.page.getByPlaceholder('Add a domain').press('Enter');
    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async editOrganization(
    organizationName: string,
    organizationDomain: string,
    organizationNewName: string
  ) {
    await this.page
      .getByRole('row', {
        name: `${organizationName} ${organizationDomain} Open`,
      })
      .getByRole('button')
      .click();
    await this.page.getByLabel('Edit Organization').click();
    await this.page.getByPlaceholder('Name').fill(organizationNewName);
    await this.page.getByRole('button', { name: 'Validate' }).click();
  }

  async deleteOrganization(
    organizationName: string,
    organizationDomain: string
  ) {
    await this.page
      .getByRole('row', {
        name: `${organizationName} ${organizationDomain} Open`,
      })
      .getByRole('button')
      .click();
    await this.page.getByLabel('Delete Organization').click();
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }
}
