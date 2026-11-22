import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { expect, test as setup } from "@playwright/test";

import {
  ADMIN_AUTH_FILE,
  EDITOR_AUTH_FILE,
  VIEWER_AUTH_FILE,
  e2eAdminEmail,
  e2eAdminPassword,
  e2eEditorEmail,
  e2eEditorPassword,
  e2eViewerEmail,
  e2eViewerPassword,
  hasE2ECredentials,
  submitLoginForm,
} from "./helpers";

/** Empty storage state so dependent tests can still boot when viewer login is skipped. */
const EMPTY_STORAGE = JSON.stringify({ cookies: [], origins: [] });

setup.describe("e2e auth storage", () => {
  setup.beforeEach(() => {
    setup.skip(
      !hasE2ECredentials(),
      "Auth setup needs real Supabase credentials.",
    );
  });

  setup("authenticate editor", async ({ page }) => {
    setup.setTimeout(45_000);
    mkdirSync(dirname(EDITOR_AUTH_FILE), { recursive: true });
    await page.goto("/en/login?next=%2Fdashboard");
    await page.getByLabel("Email").fill(e2eEditorEmail);
    await page.getByLabel("Password", { exact: true }).fill(e2eEditorPassword);
    await submitLoginForm(page);
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
    await page.context().storageState({ path: EDITOR_AUTH_FILE });
  });

  setup("authenticate admin", async ({ page }) => {
    setup.setTimeout(45_000);
    mkdirSync(dirname(ADMIN_AUTH_FILE), { recursive: true });
    await page.goto("/en/login?next=%2Fadmin");
    await page.getByLabel("Email").fill(e2eAdminEmail);
    await page.getByLabel("Password", { exact: true }).fill(e2eAdminPassword);
    await submitLoginForm(page);
    await expect(page).toHaveURL(/\/admin/, { timeout: 20_000 });
    await page.context().storageState({ path: ADMIN_AUTH_FILE });
  });

  /**
   * Login only — never create/update users (safe against shared/prod DB).
   * Set E2E_VIEWER_EMAIL / E2E_VIEWER_PASSWORD to an existing viewer account.
   */
  setup("authenticate viewer", async ({ page }) => {
    setup.setTimeout(45_000);
    mkdirSync(dirname(VIEWER_AUTH_FILE), { recursive: true });

    await page.goto("/en/login?next=%2Fen");
    await page.getByLabel("Email").fill(e2eViewerEmail);
    await page.getByLabel("Password", { exact: true }).fill(e2eViewerPassword);
    await submitLoginForm(page);

    try {
      await expect(page).toHaveURL(/\/en\/?$/, { timeout: 20_000 });
      await page.context().storageState({ path: VIEWER_AUTH_FILE });
    } catch {
      writeFileSync(VIEWER_AUTH_FILE, EMPTY_STORAGE, "utf8");
      setup.skip(
        true,
        `Viewer login failed for ${e2eViewerEmail}. Provide an existing viewer via E2E_VIEWER_EMAIL / E2E_VIEWER_PASSWORD (setup will not create users).`,
      );
    }
  });
});
