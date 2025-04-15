import { Locator, Page } from '@playwright/test';

export async function openAndGetRowActionsDropdown(page: Page, row: Locator) {
  await row.getByRole('button', { name: 'Open menu' }).click();
  return page.getByRole('menu');
}
