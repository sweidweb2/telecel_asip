import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

loadEnvConfig(process.cwd());

/**
 * Local Windows + Playwright often cannot reach Cloudflare challenge-platform
 * hosts (AAAA-only / broken IPv6 → Turnstile never mints a token and most of
 * the suite skips). Default to Cloudflare's published always-pass test keys
 * for the Playwright-managed webServer. Set E2E_TURNSTILE_LIVE=1 to use .env
 * keys instead (requires working challenge DNS/IPv6).
 *
 * @see https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 */
const useDummyTurnstile = process.env.E2E_TURNSTILE_LIVE !== "1";

if (useDummyTurnstile) {
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
  process.env.TURNSTILE_SECRET = "1x0000000000000000000000000000000AA";
}

/** Prefer an explicit E2E port; default 3000. */
const e2ePort = process.env.E2E_PORT ?? "3000";
const e2eOrigin = `http://localhost:${e2ePort}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html"]] : "list",
  use: {
    baseURL: e2eOrigin,
    trace: "on-first-retry",
    launchOptions: process.env.PLAYWRIGHT_CHROME_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROME_PATH }
      : undefined,
  },
  webServer: {
    command: process.env.CI
      ? `npm run start -- -p ${e2ePort}`
      : `npm run dev -- -p ${e2ePort}`,
    url: e2eOrigin,
    // Dummy keys only apply to the Playwright-spawned server — do not reuse a
    // manually started `next dev` that still has the real site key.
    reuseExistingServer: useDummyTurnstile ? false : !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      PORT: e2ePort,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY:
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
      TURNSTILE_SECRET: process.env.TURNSTILE_SECRET ?? "",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
