import { defineConfig, devices } from '@playwright/test';
import notificationWebhook from './tests/webhooks/notification-webhook';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    [
      'monocart-reporter',
      {
        name: `XTM Hub e2e Report`,
        outputFile: './test-results/report.html',
        onEnd: async (reportData) => {
          // teams integration with webhook
          const e2eFailed =
            reportData.summary.failed.value > 0 ||
            reportData.summary.flaky.value > 0;
          if (!!process.env.GITHUB_PR_NUMBER && e2eFailed) {
            await notificationWebhook(reportData);
          }
        },
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3002',

    // Capture screenshot after each test failure.
    screenshot: 'only-on-failure',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'yarn dev',
    url: process.env.E2E_BASE_URL ?? 'http://localhost:3002',
    reuseExistingServer: true,
  },
});
