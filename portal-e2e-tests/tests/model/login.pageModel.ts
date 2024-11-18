import { Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';

export default class LoginPage {
  constructor(private page: Page) {}

  getLoginInput() {
    return this.page.getByPlaceholder('email');
  }

  async fillLoginInput(input: string) {
    await this.getLoginInput().click();
    return this.getLoginInput().fill(input);
  }

  async fillPasswordInput(input: string) {
    await this.getPasswordInput().click();
    return this.getPasswordInput().fill(input);
  }

  getPasswordInput() {
    return this.page.getByPlaceholder('password');
  }

  getSignInButton() {
    return this.page.getByRole('button', { name: 'Sign in' });
  }

  async login() {
    await this.page.goto('/');
    await this.fillLoginInput('admin@filigran.io');
    await this.fillPasswordInput('admin');
    return this.getSignInButton().click();
  }
}
