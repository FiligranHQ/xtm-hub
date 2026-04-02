import { Page } from '@playwright/test';

export type PlatformDetails = {
  url: string;
  title: string;
  id: string;
  contract: string;
  version?: string;
};

export const OPENCTI_PLATFORM_URL: PlatformDetails = {
  url: 'http://localhost:3000',
  title: 'Open CTI Instance',
  id: '916121bf-d246-4a43-8522-24be19537b91',
  contract: 'EE',
};
export default class RegisterPage {
  constructor(private page: Page) {}

  async navigateTo(redirectionKey: string, platformDetails: PlatformDetails) {
    const url = `/redirect/${redirectionKey}?platform_url=${platformDetails.url}&platform_title=${platformDetails.title}&platform_id=${platformDetails.id}&platform_contract=${platformDetails.contract}&platform_version=${platformDetails.version}`;
    await this.page.goto(encodeURI(url));
  }

  async navigateToAndRegister(redirectionKey: string) {
    await this.navigateTo(redirectionKey, OPENCTI_PLATFORM_URL);
    await this.page.getByRole('button', { name: 'Register' }).click();
  }
}
