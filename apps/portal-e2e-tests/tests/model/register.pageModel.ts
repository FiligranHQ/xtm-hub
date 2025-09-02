import { Page } from '@playwright/test';

export default class RegisterPage {
  constructor(private page: Page) {}

  async navigateTo(platformUrl: string) {
    await this.page.goto(
      `/redirect/register-opencti?platform_url=${platformUrl}`
    );
  }

  async navigateToAndRegister(platformUrl: string) {
    await this.navigateTo(platformUrl);
    await this.page.getByRole('button', { name: 'Register' }).click();
  }
}
