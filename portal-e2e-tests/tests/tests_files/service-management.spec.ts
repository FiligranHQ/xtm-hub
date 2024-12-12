import { expect, test } from '../fixtures/baseFixtures.js';
import LoginPage from '../model/login.pageModel';
import {
  getSubscriptions,
  removeSubscription,
} from '../db-utils/subscription.helper';

test.beforeEach('Remove subscription', async () => {
  await removeSubscription('681fb117-e2c3-46d3-945a-0e921b5d4b6c');
});

test.afterAll('Remove subscription', async () => {
  await removeSubscription('681fb117-e2c3-46d3-945a-0e921b5d4b6c');
});

test('should confirm service management is ok', async ({ page }) => {
  await removeSubscription('681fb117-e2c3-46d3-945a-0e921b5d4b6c');

  const loginPage = new LoginPage(page);
  await loginPage.login();

  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('link', { name: 'Services' }).click();
  await page
    .getByRole('row', { name: 'Partner Vault This service' })
    .getByRole('button')
    .click();
  await page.getByText('Manage').click();

  // Add organization
  await page.getByLabel('Subscribe organization').click();
  await page.getByLabel('Organization', { exact: true }).click();
  await page.getByLabel('Thales').click();
  await page.getByRole('button', { name: 'Validate' }).click();
  await page.getByRole('main').getByText('Internal').click();
  await page.getByRole('option', { name: 'Thales' }).click();

  await expect(
    page.getByRole('cell', { name: 'admin@thales.com' })
  ).toBeVisible();
  await expect(page.getByText('ACCESS_SERVICE')).toBeVisible();
  await expect(page.getByText('MANAGE_ACCESS')).toBeVisible();

  // Add user
  await page.getByLabel('Invite user').click();
  await page.getByPlaceholder('EMAIL').click();
  await page.getByPlaceholder('EMAIL').fill('use');
  await page.getByText('user@thales.com').click();
  await page.getByRole('dialog').nth(1).press('Enter');
  await page
    .locator('div')
    .filter({ hasText: 'Access service' })
    .nth(2)
    .click();
  await page.getByLabel('Capabilities').click();
  await page.getByLabel('Suggestions').getByText('ACCESS_SERVICE').click();
  await page
    .locator('div')
    .filter({ hasText: 'Invite user to the serviceSet' })
    .nth(1)
    .click();
  await page.getByRole('button', { name: 'Validate' }).click();

  await expect(
    page.getByRole('cell', { name: 'user@thales.com' })
  ).toBeVisible();
  await expect(page.getByText('ACCESS_SERVICE').nth(1)).toBeVisible();
  await expect(page.getByText('MANAGE_ACCESS').nth(1)).not.toBeVisible();

  // Edit user
  await page
    .getByRole('row', { name: 'user@thales.com' })
    .getByRole('button')
    .click();
  await page.getByLabel('Edit user rights').click();
  await page.getByLabel('Capabilities').click();
  await page.getByLabel('Suggestions').getByText('MANAGE_ACCESS').click();
  await page.getByLabel('Suggestions').getByText('ACCESS_SERVICE').click();
  await page.getByRole('option', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Validate' }).click();
  await expect(page.getByText('MANAGE_ACCESS').first()).toBeVisible();
  await expect(page.getByText('ACCESS_SERVICE').first()).toBeVisible();

  // Unsubscribe organization
  await page.getByLabel('Delete Organization from the').click();
  await page.getByRole('button', { name: 'Remove' }).click();
  await page.getByRole('main').getByText('Internal').click();
  await expect(page.getByRole('option', { name: 'Thales' })).not.toBeVisible();
});
