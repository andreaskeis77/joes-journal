import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for joes-journal UX smoke tests.
 *
 * Tests run against the production build served by `astro preview` so that
 * the assertions reflect what a user actually sees, not the dev HMR layer.
 * The webServer command does `astro build && astro preview`; reuse the
 * existing server when running locally to keep the loop fast.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    // Use the node-resolved local Astro binary directly so the command works
    // regardless of whether `pnpm` is on PATH in the Playwright subshell.
    command:
      "node ./node_modules/astro/astro.js build && node ./node_modules/astro/astro.js preview --host 127.0.0.1 --port 4321",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
