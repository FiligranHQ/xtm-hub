import { Locator, Page } from '@playwright/test';

export async function openAndGetRowActionsDropdown(page: Page, row: Locator) {
  // Dirty fix: make sure every dropdown is closed
  await page.click('body', { position: { x: 1, y: 1 }, force: true });
  await row.getByRole('button').click();
  const dropdown = page.getByRole('menu');
  await dropdown.waitFor();
  return dropdown;
}

export async function clickRowAction(
  page: Page,
  row: Locator,
  actionLabel: string
) {
  const dropdown = await openAndGetRowActionsDropdown(page, row);
  const button = dropdown.getByRole('button', { name: actionLabel });
  await button.waitFor();
  await button.click();
}
