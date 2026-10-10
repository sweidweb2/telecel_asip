import { expect, test } from "@playwright/test";
import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

import { e2eSuffix, submitLoginForm } from "./helpers";

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

test.describe("blogs cms", () => {
  test.beforeEach(() => {
    test.skip(!hasCredentials(), "Blog E2E requires real Supabase credentials.");
  });

  test("admin can create draft then publish; public sees published only", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const suffix = e2eSuffix();
    const title = `E2E Blog ${suffix}`;
    const slug = `e2e-blog-${suffix}`;
    const admin = adminClient();

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fblogs%2Fnew");
      await page.getByLabel("Email").fill(editorEmail);
      await page.getByLabel("Password", { exact: true }).fill(editorPassword);
      await submitLoginForm(page);
      await expect(page).toHaveURL(/\/dashboard\/blogs\/new/, {
        timeout: 20_000,
      });

      await page.getByLabel("Title", { exact: true }).fill(title);
      await page.getByLabel("Slug").fill(slug);
      await page
        .getByLabel("Summary")
        .fill("E2E summary for the insights blog CMS coverage.");
      await page.getByLabel("Author", { exact: true }).fill("E2E Author");
      await page.getByRole("button", { name: "Founder Stories" }).click();
      await page.locator(".ProseMirror").click();
      await page.keyboard.type(
        "This is the E2E body content for a published insight article.",
      );
      await page.getByRole("button", { name: "Create blog" }).click();

      const createdDialog = page.getByRole("dialog");
      await expect(
        createdDialog.getByRole("heading", { name: "Blog created" }),
      ).toBeVisible({ timeout: 20_000 });
      await createdDialog
        .getByRole("button", { name: "Edit this post" })
        .click();
      await expect(page).toHaveURL(/\/dashboard\/blogs\/[0-9a-f-]+/, {
        timeout: 20_000,
      });

      // Draft must not be publicly readable.
      // Next.js App Router can serve not-found UI with HTTP 200 in dev — assert content.
      const { data: draftRow, error: draftLookupError } = await admin
        .from("blogs")
        .select("status")
        .eq("slug", slug)
        .maybeSingle();
      if (draftLookupError) throw draftLookupError;
      expect(draftRow?.status).toBe("draft");

      await page.goto(`/en/insights/${slug}`);
      await expect(page.getByText("Page not found")).toBeVisible({
        timeout: 20_000,
      });

      await page.goto("/dashboard/blogs");
      await page.getByRole("link", { name: new RegExp(title) }).click();
      await page.getByRole("checkbox", { name: "Published (visible on Insights)" }).click();
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(
        page.locator("[data-sonner-toast]").filter({
          hasText: "Blog updated successfully.",
        }),
      ).toBeVisible({ timeout: 20_000 });

      await page.goto(`/en/insights/${slug}`);
      await expect(page.getByRole("heading", { name: title })).toBeVisible({
        timeout: 20_000,
      });
    } finally {
      await admin.from("blogs").delete().eq("slug", slug);
    }
  });

  test("non-admin is redirected away from blogs", async ({ page }) => {
    test.setTimeout(60_000);
    if (!supabaseUrl || !anonKey) {
      throw new Error("Supabase credentials missing");
    }

    const suffix = e2eSuffix();
    const email = `blog.viewer.${suffix}@example.com`;
    const password = "Testpass1";
    const admin = adminClient();
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: "Blog E2E Viewer" },
        app_metadata: { app_role: "viewer" },
      });
    if (createError) throw createError;

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fblogs");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await submitLoginForm(page);
      await expect(page).toHaveURL(/\/(en|fr)\/?$/, { timeout: 20_000 });

      await page.goto("/dashboard/blogs");
      await expect(page).toHaveURL(/\/(en|fr)\/?$/, { timeout: 20_000 });
    } finally {
      await admin.auth.admin.deleteUser(created.user.id);
    }
  });
});
