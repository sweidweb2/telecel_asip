import { expect, test } from "@playwright/test";
import { nanoid } from "nanoid";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

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
    const suffix = nanoid(8).toLowerCase();
    const name = `E2E Startup ${suffix}`;
    const slug = `e2e-startup-${suffix}`;
    const admin = adminClient();

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fportfolio%2Fnew");
      await page.getByLabel("Email").fill(adminEmail);
      await page.getByLabel("Password").fill(adminPassword);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/dashboard\/portfolio\/new/, {
        timeout: 20_000,
      });

      await page.getByLabel("Name").fill(name);
      await page.getByLabel("Slug").fill(slug);
      await page
        .getByLabel("Description")
        .fill("E2E description for the portfolio startup CMS coverage.");
      await page.getByLabel("Industry").fill("Fintech");
      await page.getByLabel("Problem").fill("Payments are fragmented.");
      await page.getByLabel("Solution").fill("Unified merchant rails.");
      await page.getByRole("button", { name: "Create startup" }).click();

      await expect(page).toHaveURL(/\/dashboard\/portfolio\/[0-9a-f-]+/, {
        timeout: 20_000,
      });
      await expect(
        page.locator("[data-sonner-toast]").filter({
          hasText: "Startup created successfully.",
        }),
      ).toBeVisible({ timeout: 20_000 });

      const draftResponse = await page.goto(`/en/founders/${slug}`);
      expect(draftResponse?.status()).toBe(404);

      await page.goto("/dashboard/portfolio");
      await page.getByRole("link", { name: new RegExp(name) }).click();
      await page.getByLabel("Status").click();
      await page.getByRole("option", { name: "Active" }).click();
      await page.getByRole("button", { name: "Save changes" }).click();
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
      await page.getByLabel("Status").click();
      await page.getByRole("option", { name: "Inactive" }).click();
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(
        page.locator("[data-sonner-toast]").filter({
          hasText: "Startup updated successfully.",
        }),
      ).toBeVisible({ timeout: 20_000 });

      const inactiveResponse = await page.goto(`/en/founders/${slug}`);
      expect(inactiveResponse?.status()).toBe(404);

      await page.goto("/dashboard/portfolio");
      await page.getByRole("link", { name: new RegExp(name) }).click();
      await page.getByRole("button", { name: "Delete" }).click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Delete" })
        .click();
      await expect(page).toHaveURL(/\/dashboard\/portfolio$/, {
        timeout: 20_000,
      });
    } finally {
      await admin.from("startups").delete().eq("slug", slug);
    }
  });

  test("non-admin is redirected away from portfolio", async ({ page }) => {
    test.setTimeout(60_000);
    if (!supabaseUrl || !anonKey) {
      throw new Error("Supabase credentials missing");
    }

    const suffix = nanoid(8).toLowerCase();
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
      await page.getByLabel("Password").fill(password);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });

      await page.goto("/dashboard/portfolio");
      await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
    } finally {
      await admin.auth.admin.deleteUser(created.user.id);
    }
  });
});
