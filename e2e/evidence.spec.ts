import { expect, test } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { e2eSuffix } from "./helpers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.E2E_SEED_EMAIL ?? "asweid657@gmail.com";
const adminPassword = process.env.E2E_SEED_PASSWORD ?? "ali@1234";

function hasCredentials(): boolean {
  return Boolean(
    supabaseUrl &&
      anonKey &&
      serviceRoleKey &&
      !supabaseUrl.includes("placeholder") &&
      !anonKey.startsWith("placeholder"),
  );
}

function adminClient(): SupabaseClient {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin E2E credentials are required.");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe.configure({ mode: "serial" });

test.describe("evidence cms", () => {
  test.beforeEach(() => {
    test.skip(
      !hasCredentials(),
      "Evidence E2E requires real Supabase credentials.",
    );
  });

  test("admin can create, edit, and delete an evidence record", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const suffix = e2eSuffix();
    const primarySource = `E2E Evidence source ${suffix}`;
    const editedSource = `${primarySource} edited`;
    const admin = adminClient();

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fevidence");
      await page.getByLabel("Email").fill(adminEmail);
      await page.getByLabel("Password", { exact: true }).fill(adminPassword);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/dashboard\/evidence/, {
        timeout: 20_000,
      });

      await page.locator('a[href="/dashboard/evidence/new"]').first().click();
      await expect(page).toHaveURL(/\/dashboard\/evidence\/new/, {
        timeout: 20_000,
      });

      // Load owners before filling so async option fetch cannot race the form.
      await page.getByRole("combobox", { name: "Owner" }).click();
      await expect(page.getByRole("option").first()).toBeVisible({
        timeout: 20_000,
      });
      await page.getByRole("option").first().click();

      await page.getByLabel("Primary source").fill(primarySource);
      await page.getByLabel("Period start").fill("2024-01-01");
      await page.getByLabel("Period end").fill("2024-12-31");
      await page.getByLabel("Last verified").fill("2025-01-15");
      await page.getByLabel("Review date").fill("2025-01-20");

      await page.getByRole("button", { name: "Create evidence" }).click();
      await expect(page).toHaveURL(/\/dashboard\/evidence\/[0-9a-f-]+/, {
        timeout: 20_000,
      });
      await expect(
        page.getByRole("heading", { name: "Edit evidence record" }),
      ).toBeVisible({ timeout: 20_000 });

      await page.getByLabel("Primary source").fill(editedSource);
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(
        page.locator("[data-sonner-toast]").filter({
          hasText: "Evidence record updated successfully.",
        }),
      ).toBeVisible({ timeout: 30_000 });

      await page.getByRole("button", { name: "Delete" }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: /Delete/i })
        .click();
      await expect(page).toHaveURL(/\/dashboard\/evidence$/, {
        timeout: 20_000,
      });
    } finally {
      await admin
        .from("evidence_records")
        .delete()
        .ilike("primary_source", `E2E Evidence source ${suffix}%`);
    }
  });

  test("non-admin is redirected away from evidence", async ({ page }) => {
    test.setTimeout(60_000);
    if (!supabaseUrl || !anonKey) {
      throw new Error("Supabase credentials missing");
    }

    const suffix = e2eSuffix();
    const email = `evidence.viewer.${suffix}@example.com`;
    const password = "Testpass1";
    const admin = adminClient();
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: "Evidence E2E Viewer" },
        app_metadata: { app_role: "viewer" },
      });
    if (createError) throw createError;

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fevidence");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).not.toHaveURL(/\/dashboard\/evidence/, {
        timeout: 20_000,
      });
      await expect(page).toHaveURL(/\/(en|fr)(\/?$|\/login)/);
    } finally {
      if (created.user?.id) {
        await admin.auth.admin.deleteUser(created.user.id);
      }
    }
  });
});
