import { Page } from '@playwright/test';

// The "Deploy in <platform>" flow of a resource page in XTM Hub.
export default class OneClickDeployPage {
  constructor(private page: Page) {}

  // Deploys the resource to the only connected platform and returns the platform tab it opens.
  async deployIn(platformName: string) {
    await this.page
      .getByRole('button', { name: `Deploy in ${platformName}` })
      .first()
      .click();
    const platformTabPromise = this.page.waitForEvent('popup');
    await this.page.getByRole('button', { name: 'Continue' }).click();
    const platformTab = await platformTabPromise;
    await platformTab.waitForLoadState();
    return platformTab;
  }
}
