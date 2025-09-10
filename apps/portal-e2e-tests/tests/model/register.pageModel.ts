import { Page } from '@playwright/test';

export default class RegisterPage {
  constructor(private page: Page) {}

  async navigateTo(
    redirection_key: string,
    platformUrl: string,
    platformTitle: string,
    platformId: string,
    platformContract: string,
    platformVersion?: string
  ) {
    const url = `/redirect/${redirection_key}?platform_url=${platformUrl}&platform_title=${platformTitle}&platform_id=${platformId}&platform_contract=${platformContract}&platform_version=${platformVersion}`;
    await this.page.goto(encodeURI(url));
  }

  async navigateToAndRegister(
    redirection_key: string,
    platformUrl: string,
    platformTitle: string,
    platformId: string,
    platformContract: string,
    platformVersion?: string
  ) {
    await this.navigateTo(
      redirection_key,
      platformUrl,
      platformTitle,
      platformId,
      platformContract,
      platformVersion
    );
    await this.page.getByRole('button', { name: 'Register' }).click();
  }
}
