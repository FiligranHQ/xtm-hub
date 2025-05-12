import { Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';

export default class ProfilePage {
  constructor(private page: Page) {}

  getFirstNameInput() {
    return this.page.getByPlaceholder('First name');
  }

  getLastNameInput() {
    return this.page.getByPlaceholder('Last name');
  }

  getPictureInput() {
    return this.page.getByPlaceholder('Picture');
  }

  async fillFirstNameInput(input: string) {
    await this.getFirstNameInput().click({ force: true });
    return this.getFirstNameInput().fill(input);
  }

  async fillLastNameInput(input: string) {
    await this.getLastNameInput().click();
    return this.getLastNameInput().fill(input);
  }

  async fillCountryInput(input: string) {
    await this.page.locator('form').getByRole('combobox').click();
    await this.page.getByRole('option', { name: input }).click();
  }

  async fillPictureInput(input: string) {
    await this.getPictureInput().click();
    return this.getPictureInput().fill(input);
  }

  getUpdateButton() {
    return this.page.getByRole('button', { name: 'Update' });
  }

  getFirstOrLastNameEditionWarningMessage() {
    return this.page
      .getByRole('alertdialog')
      .getByText('Do you want to continue?');
  }

  getAdminEditionWarningMessage() {
    return this.page.getByRole('alertdialog').getByText('Account modified!');
  }

  async continueAfterWarningModale() {
    await this.page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Continue' })
      .click();
  }

  async navigateTo() {
    await this.page.getByRole('button', { name: 'Open menu user' }).click();
    await this.page.getByRole('button', { name: 'Profile' }).click();
  }

  async editProfile({
    firstName,
    lastName,
    picture,
    country,
  }: {
    firstName?: string;
    lastName?: string;
    picture?: string;
    country?: string;
  }) {
    if (firstName) {
      await this.fillFirstNameInput(firstName);
    }

    if (lastName) {
      await this.fillLastNameInput(lastName);
    }

    if (country) {
      await this.fillCountryInput(country);
    }

    if (picture) {
      await this.fillPictureInput(picture);
    }

    return this.getUpdateButton().click();
  }
}
