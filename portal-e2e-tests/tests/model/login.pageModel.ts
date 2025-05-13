import { Page } from '@playwright/test';

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

  async login(userEmail = 'admin@filigran.io', password = 'admin') {
    await this.page.goto('/');
    await this.fillLoginInput(userEmail);
    await this.fillPasswordInput(password);
    return this.getSignInButton().click();
  }

  async logout() {
    await this.page.getByRole('button', { name: 'Open menu user' }).click();
    await this.page.getByRole('button', { name: 'Logout' }).click();
  }
}
