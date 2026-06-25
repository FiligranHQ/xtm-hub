// fixtures.js for v8 coverage
import { expect, test as testBase } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';
import { beforeEach } from './hooks';

const test = testBase.extend({
  autoTestFixture: [
    async ({ page }, use) => {
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

      await beforeEach();

      await page.context().addCookies([
        {
          name: 'xtmhub_consent',
          value: encodeURIComponent(
            JSON.stringify({
              version: 1,
              timestamp: new Date().toISOString(),
              services: { 'google-analytics': false, hubspot: false },
            })
          ),
          url: process.env.E2E_BASE_URL ?? 'http://localhost:3002',
        },
      ]);

      await use('autoTestFixture');

      // console.log('autoTestFixture teardown...');
      if (activateCoverage) {
        const [jsCoverage, cssCoverage] = await Promise.all([
          page.coverage.stopJSCoverage(),
          page.coverage.stopCSSCoverage(),
        ]);
        const coverageList = [...jsCoverage, ...cssCoverage];
        if (coverageList.length) {
          await addCoverageReport(coverageList, test.info());
        }
      }
    },
    {
      scope: 'test',
      auto: true,
    },
  ],
});

export { test, expect };
