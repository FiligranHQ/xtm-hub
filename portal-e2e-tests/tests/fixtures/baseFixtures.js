// fixtures.js for v8 coverage
import { expect, test as testBase } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';

const test = testBase.extend({
  autoTestFixture: [
    async ({ page }, use) => {
      // NOTE: it depends on your project name
      const activateCoverage = process.env.E2E_COVERAGE;

      // console.log('autoTestFixture setup...');
      // coverage API is chromium only
      if (activateCoverage) {
        await Promise.all([
          page.coverage.startJSCoverage({
            resetOnNavigation: false,
          }),
          page.coverage.startCSSCoverage({
            resetOnNavigation: false,
          }),
        ]);
      }

      await use('autoTestFixture');

      // console.log('autoTestFixture teardown...');
      if (activateCoverage) {
        const [jsCoverage, cssCoverage] = await Promise.all([
          page.coverage.stopJSCoverage(),
          page.coverage.stopCSSCoverage(),
        ]);
        const coverageList = [...jsCoverage, ...cssCoverage];
        // console.log(coverageList.map((item) => item.url));
        await addCoverageReport(coverageList, test.info());
      }
    },
    {
      scope: 'test',
      auto: true,
    },
  ],
  page: async ({ page }, use) => {
    // Hide toasts for e2e tests
    // Toasts can intercept user interactions and prevent them from being tested.
    const addStyles = async () => {
      await page.addStyleTag({
        content: `
        div[role="region"][aria-label="Notifications (F8)"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          position: fixed !important;
          z-index: -9999 !important;
        }
      `,
      });
      console.log('Style tag added to page');
    };

    /*page.on('framenavigated', async (frame) => {
      if (frame === page.mainFrame()) {
        await frame.waitForLoadState('domcontentloaded');
        await addStyles();
      }
    });

    page.on('load', addStyles);*/

    await use(page);
  },
});
export { test, expect };
