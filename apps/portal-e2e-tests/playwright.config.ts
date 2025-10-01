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
  retries: 2,
  /* Parallel test is breaking tests */
  workers: 1,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      pathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
      stylePath: './tests/screenshot.css',
    },
  },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    [
      'playwright-ctrf-json-reporter',
      {
        minimal: false,
        screenshot: true,
        annotations: true,
      },
    ],
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
    headless: true,
    viewport: { width: 1280, height: 800 }, // or keep Desktop Chrome defaults
    deviceScaleFactor: 1,
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'UTC',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'teardown',
    },
    {
      name: 'teardown',
      testMatch: /.*\.teardown\.ts/,
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
