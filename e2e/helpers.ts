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

/** Admin panel seed (`/admin`) — Users full, Performance, Backup. */
export const e2eAdminEmail =
  process.env.E2E_SEED_EMAIL ?? "asweid657@gmail.com";
export const e2eAdminPassword = process.env.E2E_SEED_PASSWORD ?? "ali@1234";

/** Editor panel seed (`/dashboard`) — CMS + limited Users. */
export const e2eEditorEmail =
  process.env.E2E_EDITOR_EMAIL ?? "gbitar@telecelglobal.com";
export const e2eEditorPassword =
  process.env.E2E_EDITOR_PASSWORD ?? "password";

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

async function loginAs(
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
    timeout: 20_000,
  });
}

/** Sign in as editor and land on a `/dashboard` path. */
export async function loginAsEditor(
  page: Page,
  nextPath = "/dashboard",
): Promise<void> {
  await loginAs(page, e2eEditorEmail, e2eEditorPassword, nextPath);
}

/** Sign in as admin and land on an `/admin` path. */
export async function loginAsAdmin(
  page: Page,
  nextPath = "/admin",
): Promise<void> {
  await loginAs(page, e2eAdminEmail, e2eAdminPassword, nextPath);
}

/**
 * @deprecated Prefer `loginAsEditor` for CMS. Kept as an alias during migration.
 */
export async function loginAsStaffDashboard(
  page: Page,
  nextPath = "/dashboard",
): Promise<void> {
  await loginAsEditor(page, nextPath);
}

/**
 * Wait until Turnstile issues a token into the form's hidden field.
 * Skips the test when the widget cannot mint a token on localhost.
 */
export async function waitForTurnstileReady(
  page: Page,
  options: { testId: string; submitName: string | RegExp },
): Promise<void> {
  // Default Playwright timeout (30s) is too tight once the challenge wait is
  // included — bump so a missing token becomes a clean skip, not a hard fail.
  const info = test.info();
  if (info.timeout > 0 && info.timeout < 90_000) {
    info.setTimeout(90_000);
  }

  await expect(page.getByTestId(options.testId)).toBeVisible({
    timeout: 30_000,
  });
  const tokenInput = page.locator('input[name="turnstileToken"]');
  try {
    // Headless + network can delay Cloudflare's challenge mint.
    await expect(tokenInput).not.toHaveValue("", { timeout: 25_000 });
  } catch {
    test.skip(
      true,
      "Turnstile did not issue a token - check NEXT_PUBLIC_TURNSTILE_SITE_KEY, Cloudflare hostname allowlist for localhost, and DNS to *.challenges.cloudflare.com.",
    );
  }
  await expect(
    page.getByRole("button", { name: options.submitName }),
  ).toBeEnabled({ timeout: 5_000 });
}

/** Complete the login form Turnstile challenge and click Sign in. */
export async function submitLoginForm(page: Page): Promise<void> {
  await waitForTurnstileReady(page, {
    testId: "login-turnstile",
    submitName: "Sign in",
  });
  await page.getByRole("button", { name: "Sign in" }).click();
}

/**
 * Create a temporary viewer, sign in with `next=` to a staff path, and
 * assert the app redirects them to the locale home.
 */
export async function expectViewerRedirectedFrom(
  page: Page,
  staffPath: string,
): Promise<void> {
  const suffix = e2eSuffix();
  const email = `viewer.${suffix}@example.com`;
  const password = "Testpass1";
  const admin = e2eAdminClient();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Dashboard Viewer" },
    app_metadata: { app_role: "viewer" },
  });
  if (error) throw error;

  try {
    await page.context().clearCookies();
    await page.goto(`/en/login?next=${encodeURIComponent(staffPath)}`);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await submitLoginForm(page);
    await expect(page).toHaveURL(/\/en$/, { timeout: 20_000 });
  } finally {
    if (created.user?.id) await admin.auth.admin.deleteUser(created.user.id);
  }
}
