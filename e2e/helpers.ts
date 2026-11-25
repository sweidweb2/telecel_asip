import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { customAlphabet } from "nanoid";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { expect, type Page, test } from "@playwright/test";

/** Lowercase alphanumeric only — safe for slug suffixes (no `_` / `-`). */
const e2eAlphabet = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

export function e2eSuffix(): string {
  return e2eAlphabet();
}

export const EDITOR_AUTH_FILE = join(process.cwd(), "e2e", ".auth", "editor.json");
export const ADMIN_AUTH_FILE = join(process.cwd(), "e2e", ".auth", "admin.json");
export const VIEWER_AUTH_FILE = join(process.cwd(), "e2e", ".auth", "viewer.json");

/** Admin panel seed (`/admin`) — Users full, Performance, Backup. */
export const e2eAdminEmail =
  process.env.E2E_SEED_EMAIL ?? "asweid657@gmail.com";
export const e2eAdminPassword = process.env.E2E_SEED_PASSWORD ?? "ali@1234";

/** Editor panel seed (`/dashboard`) — CMS + limited Users. */
export const e2eEditorEmail =
  process.env.E2E_EDITOR_EMAIL ?? "gbitar@telecelglobal.com";
export const e2eEditorPassword =
  process.env.E2E_EDITOR_PASSWORD ?? "password";

/** Stable viewer used for redirect-matrix storageState (created in auth.setup). */
export const e2eViewerEmail =
  process.env.E2E_VIEWER_EMAIL ?? "e2e.viewer.asip@example.com";
export const e2eViewerPassword =
  process.env.E2E_VIEWER_PASSWORD ?? "Testpass1";

type SavedAuthState = {
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: "Strict" | "Lax" | "None";
  }>;
  origins?: Array<{
    origin: string;
    localStorage: Array<{ name: string; value: string }>;
  }>;
};

export function hasE2ECredentials(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    supabaseUrl &&
      anonKey &&
      serviceRoleKey &&
      !supabaseUrl.includes("placeholder") &&
      !anonKey.startsWith("placeholder"),
  );
}

export function e2eAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin E2E credentials are required.");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function e2eAnonClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error("Supabase anon E2E credentials are required.");
  }
  return createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function applySavedAuth(page: Page, authFile: string): Promise<boolean> {
  if (!existsSync(authFile)) return false;

  const state = JSON.parse(readFileSync(authFile, "utf8")) as SavedAuthState;
  await page.context().clearCookies();
  if (state.cookies?.length) {
    await page.context().addCookies(state.cookies);
  }

  if (state.origins?.length) {
    for (const origin of state.origins) {
      if (!origin.localStorage?.length) continue;
      await page.goto(origin.origin);
      await page.evaluate((items) => {
        for (const item of items) {
          window.localStorage.setItem(item.name, item.value);
        }
      }, origin.localStorage);
    }
  }

  return true;
}

async function loginViaUi(
  page: Page,
  email: string,
  password: string,
  nextPath: string,
): Promise<void> {
  const encoded = encodeURIComponent(nextPath);
  await page.goto(`/en/login?next=${encoded}`);
  await page.getByLabel("Email").fill(email);
  // exact: true — "Show password" toggle also matches a bare "Password" label.
  await page.getByLabel("Password", { exact: true }).fill(password);
  await submitLoginForm(page);
  await expect(page).toHaveURL(new RegExp(nextPath.replace(/\//g, "\\/")), {
    timeout: 15_000,
  });
}

async function loginWithSavedAuthOrUi(
  page: Page,
  authFile: string,
  email: string,
  password: string,
  nextPath: string,
  options?: { freshSession?: boolean },
): Promise<void> {
  const pathRe = new RegExp(nextPath.replace(/\//g, "\\/"));

  if (!options?.freshSession && (await applySavedAuth(page, authFile))) {
    await page.goto(nextPath, { waitUntil: "domcontentloaded" });
    // Stale/revoked storage can briefly land off /login then bounce there.
    try {
      await expect(page).toHaveURL(pathRe, { timeout: 8_000 });
      return;
    } catch {
      // Fall through to a real UI login.
    }
  }

  await loginViaUi(page, email, password, nextPath);
}

/**
 * Prefer saved storageState from auth.setup; fall back to a full UI login.
 * Pass `freshSession: true` when the test will log out — shared storageState
 * tokens must not be the ones revoked.
 */
export async function loginAsEditor(
  page: Page,
  nextPath = "/dashboard",
  options?: { freshSession?: boolean },
): Promise<void> {
  await loginWithSavedAuthOrUi(
    page,
    EDITOR_AUTH_FILE,
    e2eEditorEmail,
    e2eEditorPassword,
    nextPath,
    options,
  );
}

/** Sign in as admin and land on an `/admin` path. */
export async function loginAsAdmin(
  page: Page,
  nextPath = "/admin",
  options?: { freshSession?: boolean },
): Promise<void> {
  await loginWithSavedAuthOrUi(
    page,
    ADMIN_AUTH_FILE,
    e2eAdminEmail,
    e2eAdminPassword,
    nextPath,
    options,
  );
}

/** Click Sign in. */
export async function submitLoginForm(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Sign in" }).click();
}

/**
 * Admin list rows use `AdminClickableRow` (`role="button"`), not `role="row"`.
 */
export function adminListRow(page: Page, ariaLabel: string | RegExp) {
  return page.getByRole("button", { name: ariaLabel });
}

/** Sonner success toasts sit on top of the sticky actions bar and steal clicks. */
export async function dismissToasts(page: Page): Promise<void> {
  await page.evaluate(() => {
    document
      .querySelectorAll("[data-sonner-toast]")
      .forEach((node) => node.remove());
  });
}

export async function clickSaveChanges(page: Page): Promise<void> {
  await dismissToasts(page);
  await page.getByRole("button", { name: "Save changes" }).click();
}

/**
 * Flip Applications open via Settings so Next cache tags revalidate.
 * Uses editor storageState when available (no UI login).
 */
export async function setApplicationsOpenViaSettings(
  page: Page,
  open: boolean,
): Promise<void> {
  await loginAsEditor(page, "/dashboard/settings");
  const appsSwitch = page.locator("#open-applications");
  const currentlyOpen = await appsSwitch.isChecked();
  if (currentlyOpen === open) return;
  await appsSwitch.click();
  await expect(appsSwitch).toBeChecked({ checked: open });
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.locator("[data-sonner-toast]").filter({ hasText: "Settings saved" }),
  ).toBeVisible({ timeout: 20_000 });
}

/**
 * Assert a staff path redirects viewers to the locale home.
 * Uses shared viewer storageState only — never creates users (prod-safe).
 */
export async function expectViewerRedirectedFrom(
  page: Page,
  staffPath: string,
): Promise<void> {
  const applied = await applySavedAuth(page, VIEWER_AUTH_FILE);
  if (!applied) {
    test.skip(
      true,
      "Viewer storageState missing. Set E2E_VIEWER_EMAIL / E2E_VIEWER_PASSWORD to an existing viewer (setup will not create users).",
    );
  }

  await page.goto(staffPath);
  // Empty storage file from a skipped viewer setup lands on login — treat as skip.
  if (/\/login/.test(page.url())) {
    test.skip(
      true,
      "Viewer session unavailable. Provide an existing viewer account for redirect checks.",
    );
  }
  await expect(page).toHaveURL(/\/en\/?$/, { timeout: 15_000 });
}
