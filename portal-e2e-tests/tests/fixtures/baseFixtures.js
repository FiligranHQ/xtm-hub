// fixtures.js for v8 coverage
import { expect, test as testBase } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';
import { db } from '../db-utils/db-connection';

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
});

test.beforeEach(async () => {
  await db.raw('DROP SCHEMA public CASCADE;');
  await db.raw('CREATE SCHEMA public');
  await db.raw('GRANT ALL ON SCHEMA public TO public');

  await db.migrate.latest();
  await db.seed.run();
});

export { test, expect };
