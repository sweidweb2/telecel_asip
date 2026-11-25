import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import os from "node:os";
import { join } from "node:path";

import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";


loadEnvConfig(process.cwd());


/**
 * Default away from `next dev`'s usual :3000 so local E2E can start an
 * isolated server without fighting the developer's app.
 * Override with E2E_PORT.
 */
const preferredPort = Number.parseInt(process.env.E2E_PORT ?? "3100", 10);

/**
 * Async Playwright config is evaluated in the runner and again in each worker.
 * Without a shared port, workers can pick a different baseURL than the process
 * that started webServer → net::ERR_CONNECTION_REFUSED.
 */
const portCachePath = join(
  process.cwd(),
  "node_modules",
  ".cache",
  "playwright-e2e-port",
);

/** True when something already accepts HTTP on this origin (IPv4/IPv6 safe). */
async function isOriginReachable(origin: string): Promise<boolean> {
  try {
    await fetch(origin, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(2_000),
    });
    return true;
  } catch {
    return false;
  }
}

function canBind(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.unref();
    server.once("error", () => resolve(false));
    // Bind dual-stack where possible so Windows IPv6 listeners are detected.
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
  });
}

async function allocateFreePort(startPort: number): Promise<number> {
  for (let port = startPort; port < startPort + 50; port += 1) {
    if (await canBind(port)) return port;
  }
  throw new Error(
    `No free TCP port found from ${startPort}–${startPort + 49} for Playwright.`,
  );
}

function hasNextProductionBuild(): boolean {
  const nextDir = join(process.cwd(), ".next");
  return (
    existsSync(join(nextDir, "BUILD_ID")) ||
    existsSync(join(nextDir, "prerender-manifest.json"))
  );
}

function readCachedPort(): number | null {
  try {
    if (!existsSync(portCachePath)) return null;
    const port = Number.parseInt(readFileSync(portCachePath, "utf8").trim(), 10);
    return Number.isFinite(port) && port > 0 ? port : null;
  } catch {
    return null;
  }
}

function writeCachedPort(port: number) {
  mkdirSync(join(process.cwd(), "node_modules", ".cache"), { recursive: true });
  writeFileSync(portCachePath, String(port), "utf8");
}

function clearCachedPort() {
  try {
    unlinkSync(portCachePath);
  } catch {
    // ignore missing cache
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Workers have TEST_PARALLEL_INDEX set; the config/webServer host does not. */
function isPlaywrightWorkerProcess() {
  return process.env.TEST_PARALLEL_INDEX != null;
}

/**
 * Wait until the host has written a port *and* something answers there.
 * Rejects stale cache from a prior run (e.g. 3101 dead while this run uses 3100).
 */
async function waitForCachedPort(): Promise<number> {
  for (let attempt = 0; attempt < 600; attempt += 1) {
    const cached = readCachedPort();
    if (cached != null) {
      if (await isOriginReachable(`http://localhost:${cached}`)) {
        return cached;
      }
    }
    await sleep(100);
  }
  throw new Error(
    `Playwright worker timed out waiting for a reachable E2E server (port cache ${portCachePath}).`,
  );
}

const forceDev = process.env.E2E_WEB_SERVER === "dev";
const forceStart = process.env.E2E_WEB_SERVER === "start";

export default (async () => {
  const isCi = Boolean(process.env.CI);
  const preferStart =
    forceStart || isCi || (!forceDev && hasNextProductionBuild());

  let e2ePort: number;
  let command: string;
  let reuseExistingServer: boolean;

  /**
   * Config is evaluated more than once (host + workers, sometimes host again
   * when the next project starts). Pin the port in env + cache on first decide
   * so later evals never pick a different free port → ERR_CONNECTION_REFUSED.
   */
  const pinnedPort = Number.parseInt(
    process.env.PLAYWRIGHT_E2E_PORT ?? "",
    10,
  );
  const hasPinnedPort = Number.isFinite(pinnedPort) && pinnedPort > 0;

  if (hasPinnedPort) {
    e2ePort = pinnedPort;
    command = preferStart
      ? `npm run start -- -p ${e2ePort}`
      : `npm run dev -- -p ${e2ePort}`;
    reuseExistingServer = true;
  } else if (isPlaywrightWorkerProcess()) {
    e2ePort = await waitForCachedPort();
    process.env.PLAYWRIGHT_E2E_PORT = String(e2ePort);
    command = preferStart
      ? `npm run start -- -p ${e2ePort}`
      : `npm run dev -- -p ${e2ePort}`;
    reuseExistingServer = true;
  } else {
    // Drop stale port from a previous run before workers can latch onto it.
    clearCachedPort();

    const preferredOrigin = `http://localhost:${preferredPort}`;
    const preferredBusy = await isOriginReachable(preferredOrigin);

    e2ePort = preferredPort;
    command = preferStart
      ? `npm run start -- -p ${e2ePort}`
      : `npm run dev -- -p ${e2ePort}`;
    reuseExistingServer = !isCi;

    if (preferredBusy) {
      // Next allows only one `next dev` per project dir, so a second `next dev`
      // on another port still fails. Prefer a free port + `next start`.
      if (hasNextProductionBuild() || isCi || preferStart) {
        e2ePort = await allocateFreePort(preferredPort + 1);
        command = `npm run start -- -p ${e2ePort}`;
        reuseExistingServer = false;
        console.log(
          `[playwright] ${preferredOrigin} is in use; starting E2E on http://localhost:${e2ePort}`,
        );
      } else {
        reuseExistingServer = true;
        console.warn(
          `[playwright] ${preferredOrigin} is in use and no .next production build was found; reusing the existing server. For an isolated E2E server, run \`npm run build\` once or stop the other process.`,
        );
      }
    } else if (!preferStart) {
      console.log(
        "[playwright] Using next dev (set E2E_WEB_SERVER=start or run npm run build for faster full-suite runs).",
      );
    }

    process.env.PLAYWRIGHT_E2E_PORT = String(e2ePort);
    writeCachedPort(e2ePort);
  }

  const e2eOrigin = `http://localhost:${e2ePort}`;
  const port = String(e2ePort);
  // 2–3 workers often finishes sooner than max CPUs on a single Next server.
  const localWorkers = Math.min(3, os.availableParallelism());

  return defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    workers: isCi ? undefined : localWorkers,
    forbidOnly: isCi,
    retries: isCi ? 2 : 0,
    timeout: 45_000,
    expect: { timeout: 12_000 },
    reporter: isCi ? [["github"], ["html"]] : "list",
    use: {
      baseURL: e2eOrigin,
      trace: "on-first-retry",
      actionTimeout: 12_000,
      navigationTimeout: 20_000,
      launchOptions: process.env.PLAYWRIGHT_CHROME_PATH
        ? { executablePath: process.env.PLAYWRIGHT_CHROME_PATH }
        : undefined,
    },
    webServer: {
      command,
      url: e2eOrigin,
      reuseExistingServer,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: port,
      },
    },
    projects: [
      { name: "setup", testMatch: /auth\.setup\.ts/ },
      {
        name: "chromium",
        dependencies: ["setup"],
        testIgnore: /auth\.setup\.ts|apply-register\.spec\.ts|investor-intake\.spec\.ts/,
        use: { ...devices["Desktop Chrome"] },
      },
      // Settings flips share site_settings — run alone so they do not race others.
      {
        name: "chromium-settings",
        dependencies: ["setup"],
        testMatch: /apply-register\.spec\.ts|investor-intake\.spec\.ts/,
        fullyParallel: false,
        workers: 1,
        use: { ...devices["Desktop Chrome"] },
      },
    ],
  });
})();
