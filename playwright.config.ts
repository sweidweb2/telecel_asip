import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

loadEnvConfig(process.cwd());

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html"]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROME_PATH || undefined,
      // Challenge platform hosts (e.g. brunhild.challenges.cloudflare.com) are
      // often AAAA-only. Bundled Chromium on this Windows host fails those
      // lookups (ERR_NAME_NOT_RESOLVED), so Turnstile never mints a token and
      // the auth/CMS suite skips. Pin challenge hosts to Cloudflare anycast v4.
      args: [
        // Derived from current AAAA 2606:4700::6812:1092 / ::6812:1192
        "--host-resolver-rules=MAP brunhild.challenges.cloudflare.com 104.18.16.146, MAP *.challenges.cloudflare.com 104.18.16.146, MAP challenges.cloudflare.com 104.18.94.41, EXCLUDE localhost",
      ],
    },
  },
  webServer: {
    command: process.env.CI ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
