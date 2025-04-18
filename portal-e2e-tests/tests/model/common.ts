import { Locator, Page } from '@playwright/test';
import { expect } from '../fixtures/baseFixtures';

export async function forceCloseAllDropdowns(page: Page) {
  await page.click('body', { position: { x: 1, y: 1 }, force: true });
}

export async function openAndGetRowActionsDropdown(page: Page, row: Locator) {
  await forceCloseAllDropdowns(page);
  const button = row.locator('td:last-child').getByRole('button');
  await button.click();
  const dropdown = page.getByRole('menu');
  await dropdown.waitFor({ state: 'visible' });
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

export async function waitForDrawerToClose(page: Page) {
  await page.locator('body > [role="dialog"]').waitFor({ state: 'hidden' });
  await forceCloseAllDropdowns(page);
}

export async function waitForToasterToHide(page: Page) {
  await page
    .locator('[role="region"] li[role="status"]')
    .waitFor({ state: 'hidden' });
}

export async function waitForReactIdle(page: Page, timeout = 5000) {
  try {
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        // Detect React
        if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          // This method waits for all React updates to complete
          const checkReactUpdates = () => {
            const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
            if (hook.reactDevtoolsAgent && hook.reactDevtoolsAgent._fibers) {
              const hasUpdates = Object.values(
                hook.reactDevtoolsAgent._fibers
              ).some(
                (fiber: any) =>
                  fiber.memoizedState && fiber.memoizedState.isProcessing
              );
              if (!hasUpdates) {
                resolve();
                return;
              }
            } else {
              // If we can't check React's state, resolve after a short delay
              setTimeout(resolve, 200);
              return;
            }
            setTimeout(checkReactUpdates, 50);
          };

          checkReactUpdates();
        } else {
          // If React DevTools is not available, use requestAnimationFrame
          // which runs after React has finished rendering
          setTimeout(() => {
            requestAnimationFrame(() => {
              setTimeout(resolve, 50);
            });
          }, 50);
        }
      });
    }, timeout);
  } catch (e) {
    console.warn('Timeout waiting for React to stabilize:', e);
  }
}
