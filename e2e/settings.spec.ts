import { expect, test } from "@playwright/test";

import {
  e2eAdminClient,
  e2eSuffix,
  hasE2ECredentials,
  loginAsAdmin,
} from "./helpers";

test.describe.configure({ mode: "serial" });

test.describe("site settings", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Settings E2E requires real Supabase credentials.",
    );
  });

  test("admin can toggle newsletter signup", async ({ page }) => {
    test.setTimeout(90_000);
    const admin = e2eAdminClient();
    const { data: before } = await admin
      .from("site_settings")
      .select("open_applications, newsletter_signup_enabled")
      .eq("id", 1)
      .maybeSingle();

    try {
      await loginAsAdmin(page, "/dashboard/settings");
      const newsletter = page.locator("#newsletter-signup");
      const wasOn = await newsletter.isChecked();
      await newsletter.click();
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(
        page.locator("[data-sonner-toast]").filter({ hasText: "Settings saved" }),
      ).toBeVisible({ timeout: 20_000 });
      await expect(newsletter).toBeChecked({ checked: !wasOn });
    } finally {
      await admin
        .from("site_settings")
        .update({
          open_applications: Boolean(before?.open_applications),
          newsletter_signup_enabled: Boolean(before?.newsletter_signup_enabled),
        })
        .eq("id", 1);
    }
  });

  test("viewer cannot open settings", async ({ page }) => {
    test.setTimeout(60_000);
    const suffix = e2eSuffix();
    const email = `settings.viewer.${suffix}@example.com`;
    const password = "Testpass1";
    const admin = e2eAdminClient();
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Settings Viewer" },
      app_metadata: { app_role: "viewer" },
    });
    if (error) throw error;

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fsettings");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(password);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/en$/, { timeout: 20_000 });
    } finally {
      if (created.user?.id) {
        await admin.auth.admin.deleteUser(created.user.id);
      }
    }
  });
});
