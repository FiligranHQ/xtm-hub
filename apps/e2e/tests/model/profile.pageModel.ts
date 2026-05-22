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

  getUpdateButton() {
    return this.page.getByRole('button', { name: 'Update profile' });
  }

  getUpdatePictureButton() {
    return this.page.getByRole('button', { name: 'Update picture' });
  }

  getEditPictureButton() {
    return this.page.getByRole('button', { name: 'Edit' });
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
    await this.page.getByRole('menuitem', { name: 'Profile' }).click();
  }

  async changeLanguage(label: string) {
    await this.page.getByRole('combobox', { name: 'Language' }).click();
    await this.page.getByRole('option', { name: label }).click();
  }

  async uploadProfilePicture(filePath: string) {
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    await this.getUpdatePictureButton().click();
  }

  async editProfile({
    firstName,
    lastName,
    country,
  }: {
    firstName?: string;
    lastName?: string;
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

    return this.getUpdateButton().click();
  }
}
