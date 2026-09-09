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

export const e2eAdminEmail =
  process.env.E2E_SEED_EMAIL ?? "asweid657@gmail.com";
export const e2eAdminPassword = process.env.E2E_SEED_PASSWORD ?? "ali@1234";

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

export async function loginAsAdmin(
  page: Page,
  nextPath = "/dashboard",
): Promise<void> {
  const encoded = encodeURIComponent(nextPath);
  await page.goto(`/en/login?next=${encoded}`);
  await page.getByLabel("Email").fill(e2eAdminEmail);
  await page.getByLabel("Password").fill(e2eAdminPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(new RegExp(nextPath.replace(/\//g, "\\/")), {
    timeout: 20_000,
  });
}

/**
 * Wait until Turnstile issues a token into the form's hidden field.
 * Skips the test when the widget cannot mint a token on localhost.
 */
export async function waitForTurnstileReady(
  page: Page,
  options: { testId: string; submitName: string | RegExp },
): Promise<void> {
  await expect(page.getByTestId(options.testId)).toBeVisible({
    timeout: 30_000,
  });
  const tokenInput = page.locator('input[name="turnstileToken"]');
  try {
    await expect(tokenInput).not.toHaveValue("", { timeout: 60_000 });
  } catch {
    test.skip(
      true,
      "Turnstile did not issue a token - check NEXT_PUBLIC_TURNSTILE_SITE_KEY and hostname allowlist for localhost.",
    );
  }
  await expect(
    page.getByRole("button", { name: options.submitName }),
  ).toBeEnabled({ timeout: 5_000 });
}

/**
 * Create a temporary viewer, sign in with `next=` to a dashboard path, and
 * assert the app redirects them to the locale home.
 */
export async function expectViewerRedirectedFrom(
  page: Page,
  dashboardPath: string,
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
    await page.goto(
      `/en/login?next=${encodeURIComponent(dashboardPath)}`,
    );
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/en$/, { timeout: 20_000 });
  } finally {
    if (created.user?.id) await admin.auth.admin.deleteUser(created.user.id);
  }
}
