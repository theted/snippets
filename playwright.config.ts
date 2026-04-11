import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests run against a live deployment.
 *
 * Required environment variables:
 *   E2E_BASE_URL  – URL of the deployed frontend  (e.g. https://snippets.example.com)
 *   E2E_API_URL   – URL of the deployed API server (e.g. https://snippets.example.com:3200)
 *                   Falls back to E2E_BASE_URL with port 3200 when omitted.
 */

const baseURL = process.env.E2E_BASE_URL;

if (!baseURL) {
  throw new Error(
    'E2E_BASE_URL is required. Set it to the production frontend URL before running E2E tests.',
  );
}

export default defineConfig({
  testDir: './e2e',

  // Never run tests in parallel against production – avoids noisy concurrent writes.
  fullyParallel: false,
  workers: 1,

  // Fail CI if you accidentally left test.only in code.
  forbidOnly: !!process.env.CI,

  // One retry on CI to reduce flakiness from transient network issues.
  retries: process.env.CI ? 1 : 0,

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    // Give production a bit of extra breathing room.
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
