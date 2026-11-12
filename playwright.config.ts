import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    extraHTTPHeaders: {
      "x-playwright-test": "true",
      "x-playwright-bypass-token":
        process.env.PLAYWRIGHT_BYPASS_TOKEN || "ventara-playwright-local-bypass-token",
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.CI ? {} : { channel: "chrome" }),
      },
    },
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        ...(process.env.CI ? {} : { channel: "chrome" }),
      },
    },
  ],
  webServer: {
    command:
      "PLAYWRIGHT_TEST=1 PLAYWRIGHT_BYPASS_TOKEN=ventara-playwright-local-bypass-token npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      PLAYWRIGHT_TEST: "1",
      PLAYWRIGHT_BYPASS_TOKEN: "ventara-playwright-local-bypass-token",
    },
  },
});
