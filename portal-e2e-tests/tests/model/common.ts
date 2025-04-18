import { Locator, Page } from '@playwright/test';

export async function forceCloseAllDropdowns(page: Page) {
  await page.click('body', { position: { x: 1, y: 1 }, force: true });
}

export async function openAndGetRowActionsDropdown(page: Page, row: Locator) {
  await forceCloseAllDropdowns(page);
  await row.locator('td:last-child').getByRole('button').click();
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
      return new Promise((resolve) => {
        const w = window as any;
        // Détection de React
        if (w.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          // Cette fonction attend que toutes les mises à jour React soient terminées
          const checkReactUpdates = () => {
            const hook = w.__REACT_DEVTOOLS_GLOBAL_HOOK__;
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
              // Si on ne peut pas vérifier l'état de React, on résout après un court délai
              setTimeout(resolve, 100);
              return;
            }
            setTimeout(checkReactUpdates, 50);
          };

          checkReactUpdates();
        } else {
          // Si React DevTools n'est pas disponible, on utilise requestAnimationFrame
          // qui s'exécute généralement après que React a terminé de rendre
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
