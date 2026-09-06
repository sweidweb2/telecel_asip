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

test.describe("partners cms", () => {
  test.beforeEach(() => {
    test.skip(
      !hasCredentials(),
      "Partners E2E requires real Supabase credentials.",
    );
  });

  test("admin can create, edit from the detail page, and delete a partner", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const suffix = e2eSuffix();
    const name = `E2E Partner ${suffix}`;
    const editedName = `${name} edited`;
    const admin = adminClient();

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fpartners");
      await page.getByLabel("Email").fill(adminEmail);
      await page.getByLabel("Password").fill(adminPassword);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/dashboard\/partners/, {
        timeout: 20_000,
      });

      await page.locator('a[href="/dashboard/partners/new"]').first().click();
      await expect(page).toHaveURL(/\/dashboard\/partners\/new/, {
        timeout: 20_000,
      });
      await page.getByLabel("Name").fill(name);
      await page.getByLabel("Organisation").fill("E2E Ecosystem");
      await page.getByLabel("Type").click();
      await page.getByRole("option", { name: "Mentors / operators" }).click();
      await page
        .getByLabel("Role / contribution")
        .fill("Mentoring and market introductions.");
      await page.getByRole("button", { name: "Create partner" }).click();

      await expect(page).toHaveURL(/\/dashboard\/partners\/[0-9a-f-]+/, {
        timeout: 20_000,
      });
      await expect(
        page.getByRole("heading", { name: "Edit partner" }),
      ).toBeVisible({ timeout: 20_000 });
      await expect(page.getByLabel("Role / contribution")).toHaveValue(
        "Mentoring and market introductions.",
      );

      await page.getByLabel("Name").fill(editedName);
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(
        page.locator("[data-sonner-toast]").filter({
          hasText: "Partner updated successfully.",
        }),
      ).toBeVisible({ timeout: 30_000 });
      await expect(
        page.getByRole("button", { name: "Save changes" }),
      ).toBeDisabled({ timeout: 10_000 });

      await page.getByRole("button", { name: "Delete" }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Delete partner" })
        .click();
      await expect(page).toHaveURL(/\/dashboard\/partners$/, {
        timeout: 20_000,
      });
    } finally {
      await admin.from("partners").delete().ilike("name", `E2E Partner ${suffix}%`);
    }
  });

  test("picking a logo on the detail page enables Save without other edits", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const suffix = e2eSuffix();
    const name = `E2E Partner Logo ${suffix}`;
    const admin = adminClient();
    // Minimal 1×1 PNG — enough to unlock Save via pendingFile (upload may still process).
    const tinyPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );

    const { data: inserted, error } = await admin
      .from("partners")
      .insert({
        name,
        type: "mentors",
        is_active: true,
        logo_permission: true,
      })
      .select("id")
      .single();
    if (error) throw error;

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fpartners");
      await page.getByLabel("Email").fill(adminEmail);
      await page.getByLabel("Password").fill(adminPassword);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/dashboard\/partners/, {
        timeout: 20_000,
      });

      await page.goto(`/dashboard/partners/${inserted.id}`);
      await expect(
        page.getByRole("heading", { name: "Edit partner" }),
      ).toBeVisible({ timeout: 20_000 });

      const save = page.getByRole("button", { name: "Save changes" });
      await expect(save).toBeDisabled();

      await page.locator('input[type="file"]').setInputFiles({
        name: "e2e-logo.png",
        mimeType: "image/png",
        buffer: tinyPng,
      });
      await expect(save).toBeEnabled({ timeout: 10_000 });

      await save.click();
      await expect(
        page.locator("[data-sonner-toast]").filter({
          hasText: /Partner updated successfully|logo could not be uploaded/i,
        }),
      ).toBeVisible({ timeout: 30_000 });
      await expect(save).toBeDisabled({ timeout: 10_000 });
    } finally {
      await admin.from("partners").delete().eq("id", inserted.id);
    }
  });

  test("public page hides the logo when publication permission is not granted", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const suffix = e2eSuffix();
    const name = `E2E Unapproved ${suffix}`;
    const admin = adminClient();

    const { error } = await admin.from("partners").insert({
      name,
      type: "mentors",
      is_active: true,
      logo_permission: false,
      logo_url: `${supabaseUrl}/storage/v1/object/public/partners/fake/${suffix}.webp`,
    });
    if (error) throw error;

    try {
      await page.goto("/en/partners");
      const tile = page.getByRole("listitem").filter({ hasText: name });
      await expect(tile).toBeVisible({ timeout: 20_000 });
      // Rendering check only — the real boundary is asserted below, since a
      // clean page does not prove the URL is unreachable.
      await expect(tile.locator("img")).toHaveCount(0);
      expect(await page.content()).not.toContain(`${suffix}.webp`);
    } finally {
      await admin.from("partners").delete().eq("name", name);
    }
  });

  test("anon cannot read the partners table and the view hides unapproved logos", async () => {
    test.setTimeout(60_000);
    const suffix = e2eSuffix();
    const name = `E2E Anon ${suffix}`;
    const logoUrl = `${supabaseUrl}/storage/v1/object/public/partners/fake/${suffix}.webp`;
    const admin = adminClient();
    const anon = createClient(supabaseUrl!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: insertError } = await admin.from("partners").insert({
      name,
      type: "mentors",
      is_active: true,
      logo_permission: false,
      logo_url: logoUrl,
    });
    if (insertError) throw insertError;

    try {
      // The base table is closed to anon, so the raw logo_url is unreachable.
      const table = await anon.from("partners").select("logo_url").eq("name", name);
      expect(table.error).not.toBeNull();
      expect(table.data).toBeNull();

      const view = await anon
        .from("partners_public")
        .select("name, logo_url")
        .eq("name", name)
        .single();
      expect(view.error).toBeNull();
      expect(view.data?.logo_url).toBeNull();
    } finally {
      await admin.from("partners").delete().eq("name", name);
    }
  });

  test("non-admin is redirected away from partners", async ({ page }) => {
    test.setTimeout(60_000);
    const suffix = e2eSuffix();
    const email = `partners.viewer.${suffix}@example.com`;
    const password = "Testpass1";
    const admin = adminClient();
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: "Partners E2E Viewer" },
        app_metadata: { app_role: "viewer" },
      });
    if (createError) throw createError;

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fpartners");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(password);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/(en|fr)\/?$/, { timeout: 20_000 });

      await page.goto("/dashboard/partners");
      await expect(page).toHaveURL(/\/(en|fr)\/?$/, { timeout: 20_000 });
    } finally {
      await admin.auth.admin.deleteUser(created.user.id);
    }
  });
});
