import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const PHONE_SPECS = /mobile-.*\.spec\.ts/;

// Runs against the production build: `pnpm build` first, then `pnpm e2e`.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', testIgnore: PHONE_SPECS, use: { ...devices['Desktop Chrome'] } },
    // Phones and tablets share the phone UI; the tablet runs in Chromium because only Chromium is installed in CI.
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'tablet', use: { ...devices['iPad Mini'], browserName: 'chromium', defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: `pnpm exec next start --port ${PORT}`,
    url: `http://localhost:${PORT}/en`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
