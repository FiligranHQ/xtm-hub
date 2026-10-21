import { Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';
import { XtmHubRegistrationTab } from './register.pageModel';

// A real OpenCTI or OpenAEV instance, started by xtm-hub-dev/docker-compose-ci-{opencti,openaev}.yml.
export interface XtmPlatform {
  name: 'OpenCTI' | 'OpenAEV';
  url: string | undefined;
  adminEmail: string;
  adminPassword: string;
  experiencePath: string;
  disconnectButtonName: string;
  connectedToast: string;
  disconnectedToast: string;
}

export const OPENCTI: XtmPlatform = {
  name: 'OpenCTI',
  url: process.env.OPENCTI_URL,
  adminEmail: process.env.OPENCTI_ADMIN_EMAIL ?? 'admin@opencti.io',
  adminPassword: process.env.OPENCTI_ADMIN_PASSWORD ?? 'admin',
  experiencePath: '/dashboard/settings/experience',
  disconnectButtonName: 'Disconnect from XTM Hub',
  connectedToast: 'Your OpenCTI product is successfully connected',
  disconnectedToast: 'Your OpenCTI product is successfully disconnected',
};

// OpenAEV prefixes its routes with the tenant: this is the id of its default tenant.
const OPENAEV_DEFAULT_TENANT_ID = '2cffad3a-0001-4078-b0e2-ef74274022c3';

export const OPENAEV: XtmPlatform = {
  name: 'OpenAEV',
  url: process.env.OPENAEV_URL,
  adminEmail: process.env.OPENAEV_ADMIN_EMAIL ?? 'admin@openaev.io',
  adminPassword: process.env.OPENAEV_ADMIN_PASSWORD ?? 'admin',
  experiencePath: `/${OPENAEV_DEFAULT_TENANT_ID}/admin/settings/experience`,
  disconnectButtonName: 'Disconnect XTM Hub',
  connectedToast: 'Your OpenAEV platform is successfully connected',
  disconnectedToast: 'Your OpenAEV platform is successfully disconnected',
};

export default class XtmPlatformPage {
  constructor(
    private page: Page,
    private platform: XtmPlatform
  ) {}

  async login() {
    await this.page.goto(this.platform.url ?? '');
    await this.page.getByLabel('Login').fill(this.platform.adminEmail);
    await this.page
      .getByLabel('Password', { exact: true })
      .fill(this.platform.adminPassword);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
    // OpenCTI shows its login form on any URL, so first wait for the form to go, then for the home page:
    // OpenAEV redirects there after login.
    await expect(this.page.getByLabel('Login')).toBeHidden();
    await this.page.waitForURL(/\/(dashboard|admin)/);
  }

  async navigateToExperience() {
    // A redirect the platform still runs after login can abort this navigation: retry until the card shows.
    await expect(async () => {
      await this.page.goto(
        `${this.platform.url}${this.platform.experiencePath}`
      );
      await expect(this.getXtmHubCard()).toBeVisible({ timeout: 10_000 });
    }).toPass({ timeout: 45_000 });
  }

  getXtmHubCard() {
    return this.page.getByTestId('experience-xtm-hub-card');
  }

  getConnectionStatus(status: 'Connected' | 'Not connected') {
    return this.getXtmHubCard().getByText(status, { exact: true }).first();
  }

  // Starts the connection or disconnection process and returns the XTM Hub tab it opens.
  async openXtmHubTab(buttonName: string) {
    await this.getXtmHubCard()
      .getByRole('button', { name: buttonName })
      .click();
    const xtmHubTabPromise = this.page.waitForEvent('popup');
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Continue', exact: true })
      .click();
    const xtmHubTab = await xtmHubTabPromise;
    await xtmHubTab.waitForLoadState();
    return xtmHubTab;
  }

  openConnectionTab() {
    return this.openXtmHubTab('Connect to XTM Hub');
  }

  // Connects the platform from its settings, the way the user does, and waits for it to show "Connected".
  async connectToXtmHub(displayedName: string) {
    const xtmHubTab = new XtmHubRegistrationTab(await this.openConnectionTab());
    await xtmHubTab.connect(displayedName);
    await expect(this.getConnectionStatus('Connected')).toBeVisible();
  }

  openDisconnectionTab() {
    return this.openXtmHubTab(this.platform.disconnectButtonName);
  }
}
