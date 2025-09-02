import { Page } from '@playwright/test';

export default class RegisterPage {
  constructor(private page: Page) {}

  async navigateTo(
    platformUrl: string,
    platformTitle: string,
    platformId: string,
    platformContract: string
  ) {
    const url = `/redirect/register-opencti?platform_url=${platformUrl}&platform_title=${platformTitle}&platform_id=${platformId}&platform_contract=${platformContract}`;
    await this.page.goto(encodeURI(url));
  }

  async navigateToAndRegister(
    platformUrl: string,
    platformTitle: string,
    platformId: string,
    platformContract: string
  ) {
    await this.navigateTo(
      platformUrl,
      platformTitle,
      platformId,
      platformContract
    );
    await this.page.getByRole('button', { name: 'Register' }).click();
  }
}
