import { Page } from '@playwright/test';

export const waitForAllImageLoaded = async (page: Page) => {
  await page.waitForLoadState('load');

  await page.waitForFunction(() => {
    const images = document.querySelectorAll('img');
    return Array.from(images).every((img) => img.complete);
  });
};
