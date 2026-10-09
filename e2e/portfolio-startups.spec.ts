import { expect, test } from "@playwright/test";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

import { e2eSuffix, submitLoginForm, clickSaveChanges } from "./helpers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const editorEmail = process.env.E2E_EDITOR_EMAIL ?? "gbitar@telecelglobal.com";
const editorPassword = process.env.E2E_EDITOR_PASSWORD ?? "password";

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

test.describe("portfolio startups cms", () => {
  test.beforeEach(() => {
    test.skip(
      !hasCredentials(),
      "Portfolio E2E requires real Supabase credentials.",
    );
  });

  test("admin can create draft then activate; public sees active only", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const suffix = e2eSuffix();
    const name = `E2E Startup ${suffix}`;
    const slug = `e2e-startup-${suffix}`;
    const admin = adminClient();

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fportfolio%2Fnew");
      await page.getByLabel("Email").fill(editorEmail);
      await page.getByLabel("Password", { exact: true }).fill(editorPassword);
      await submitLoginForm(page);
      await expect(page).toHaveURL(/\/dashboard\/portfolio\/new/, {
        timeout: 20_000,
      });

      await page
        .getByRole("button", { name: /Fill form with dummy data/i })
        .click();
      await page.getByLabel("Name").fill(name);
      await page.getByLabel("Slug").fill(slug);
      await page
        .getByLabel("Description")
        .fill("E2E description for the portfolio startup CMS coverage.");

      for (let attempt = 0; attempt < 8; attempt += 1) {
        const create = page.getByRole("button", { name: "Create startup" });
        if (await create.isVisible()) {
          await expect(create).toBeEnabled({ timeout: 10_000 });
          await create.click();
          break;
        }
        await page.getByRole("button", { name: "Continue", exact: true }).click();
      }

      await expect(page).toHaveURL(/\/dashboard\/portfolio\/[0-9a-f-]+/, {
        timeout: 20_000,
      });
      await expect(
        page.getByRole("heading", { name: "Edit startup" }),
      ).toBeVisible({ timeout: 20_000 });

      await page.goto(`/en/founders/${slug}`);
      await expect(page.getByText("Page not found")).toBeVisible({
        timeout: 20_000,
      });

      await page.goto("/dashboard/portfolio");
      await page.getByRole("link", { name: new RegExp(name) }).click();
      await expect(page).toHaveURL(/\/dashboard\/portfolio\/[0-9a-f-]+/, {
        timeout: 20_000,
      });
      await page.locator("#status").click();
      await page.getByRole("option", { name: "Active", exact: true }).click();
      await clickSaveChanges(page);
      await expect(
        page.locator("[data-sonner-toast]").filter({
          hasText: "Startup updated successfully.",
        }),
      ).toBeVisible({ timeout: 20_000 });

      await page.goto(`/en/founders/${slug}`);
      await expect(page.getByRole("heading", { name })).toBeVisible({
        timeout: 20_000,
      });
      await expect(
        page.getByText("E2E description for the portfolio startup CMS coverage."),
      ).toBeVisible();
      await expect(page.getByText("Payments are fragmented.")).toHaveCount(0);

      await page.goto("/dashboard/portfolio");
      await page.getByRole("link", { name: new RegExp(name) }).click();
      await expect(page).toHaveURL(/\/dashboard\/portfolio\/[0-9a-f-]+/, {
        timeout: 20_000,
      });
      await page.locator("#status").click();
      await page.getByRole("option", { name: "Inactive", exact: true }).click();
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(
        page.locator("[data-sonner-toast]").filter({
          hasText: "Startup updated successfully.",
        }),
      ).toBeVisible({ timeout: 20_000 });

      await page.goto(`/en/founders/${slug}`);
      await expect(page.getByText("Page not found")).toBeVisible({
        timeout: 20_000,
      });
    } finally {
      await admin.from("startups").delete().eq("slug", slug);
    }
  });

  test("picking a logo enables Save without other field edits", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const suffix = e2eSuffix();
    const name = `E2E Startup Logo ${suffix}`;
    const slug = `e2e-startup-logo-${suffix}`;
    const admin = adminClient();
    const tinyPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );

    const { data: inserted, error } = await admin
      .from("startups")
      .insert({
        name,
        slug,
        description: "E2E logo dirty-gate coverage.",
        status: "draft",
      })
      .select("id")
      .single();
    if (error) throw error;

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fportfolio");
      await page.getByLabel("Email").fill(editorEmail);
      await page.getByLabel("Password", { exact: true }).fill(editorPassword);
      await submitLoginForm(page);
      await expect(page).toHaveURL(/\/dashboard\/portfolio/, {
        timeout: 20_000,
      });

      await page.goto(`/dashboard/portfolio/${inserted.id}`);
      await expect(
        page.getByRole("heading", { name: "Edit startup" }),
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
          hasText: "Startup updated successfully.",
        }),
      ).toBeVisible({ timeout: 30_000 });
      await expect(save).toBeDisabled({ timeout: 10_000 });
    } finally {
      await admin.from("startups").delete().eq("id", inserted.id);
    }
  });

  test("non-admin is redirected away from portfolio", async ({ page }) => {
    test.setTimeout(60_000);
    if (!supabaseUrl || !anonKey) {
      throw new Error("Supabase credentials missing");
    }

    const suffix = e2eSuffix();
    const email = `portfolio.viewer.${suffix}@example.com`;
    const password = "Testpass1";
    const admin = adminClient();
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: "Portfolio E2E Viewer" },
        app_metadata: { app_role: "viewer" },
      });
    if (createError) throw createError;

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fportfolio");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await submitLoginForm(page);
      await expect(page).toHaveURL(/\/(en|fr)\/?$/, { timeout: 20_000 });

      await page.goto("/dashboard/portfolio");
      await expect(page).toHaveURL(/\/(en|fr)\/?$/, { timeout: 20_000 });
    } finally {
      await admin.auth.admin.deleteUser(created.user.id);
    }
  });
});
