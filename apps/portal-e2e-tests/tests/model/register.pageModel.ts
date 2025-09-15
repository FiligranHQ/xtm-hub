import { Page } from '@playwright/test';

export type PlatformDetails = {
  url: string;
  title: string;
  id: string;
  contract: string;
  version?: string;
};

export default class RegisterPage {
  constructor(private page: Page) {}

  async navigateTo(redirectionKey: string, platformDetails: PlatformDetails) {
    const url = `/redirect/${redirectionKey}?platform_url=${platformDetails.url}&platform_title=${platformDetails.title}&platform_id=${platformDetails.id}&platform_contract=${platformDetails.contract}&platform_version=${platformDetails.version}`;
    await this.page.goto(encodeURI(url));
  }

  async navigateToAndRegister(
    redirectionKey: string,
    platformDetails: PlatformDetails
  ) {
    await this.navigateTo(redirectionKey, platformDetails);
    await this.page.getByRole('button', { name: 'Register' }).click();
  }
}
