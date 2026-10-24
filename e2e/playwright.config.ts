import { defineConfig, devices } from "@playwright/test";

// Browser and accessibility suite for the four built apps (docs/browser-checks.md).
// Run `pnpm -r build` first, then `pnpm browser:check`. Chromium is the one
// deterministic gate; the Firefox runtime checks in security/ and seo/ are
// separate. To add a browser later, add a project here: the specs read only
// `page` and the viewport they set themselves.
export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  outputDir: ".results",
  globalSetup: "./global-setup.ts",
  // Keep local runs reproducible while letting independent page audits share
  // the CI load across two workers.
  workers: process.env.CI ? 2 : 1,
  fullyParallel: false,
  // Failures must not be hidden by retries locally; CI can decide later.
  retries: 0,
  timeout: 300_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
    // Never leave the machine: tests stub or block every non-local request.
    serviceWorkers: "block",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
