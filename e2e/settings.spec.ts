import { expect, test } from "@playwright/test";

import {
  e2eAdminClient,
  e2eSuffix,
  hasE2ECredentials,
  loginAsAdmin,
  loginAsEditor,
  submitLoginForm,
  dismissToasts,
} from "./helpers";

test.describe("site settings", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Settings E2E requires real Supabase credentials.",
    );
  });

  test("admin can change backup schedule on the backup page", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const admin = e2eAdminClient();
    const { data: before } = await admin
      .from("site_settings")
      .select("backup_time")
      .eq("id", 1)
      .maybeSingle();

    try {
      await loginAsAdmin(page, "/admin/backup");
      const schedule = page.getByRole("combobox", {
        name: /backup schedule/i,
      });
      await expect(schedule).toBeVisible();

      const target =
        before?.backup_time === "weekly_sun_03"
          ? "weekly_mon_03"
          : "weekly_sun_03";
      const optionLabel =
        target === "weekly_sun_03"
          ? /Weekly · Sunday 03:00 \(Lebanon\)/i
          : /Weekly · Monday 03:00 \(Lebanon\)/i;

      await schedule.click();
      await page.getByRole("option", { name: optionLabel }).click();
      await dismissToasts(page);
      await page.getByRole("button", { name: "Save settings" }).click();
      await expect(
        page
          .locator("[data-sonner-toast]")
          .filter({ hasText: /Settings saved/i }),
      ).toBeVisible({ timeout: 20_000 });

      const { data: after } = await admin
        .from("site_settings")
        .select("backup_time")
        .eq("id", 1)
        .maybeSingle();
      expect(after?.backup_time).toBe(target);
    } finally {
      await admin
        .from("site_settings")
        .update({
          backup_time: before?.backup_time ?? "weekly_sun_03",
        })
        .eq("id", 1);
    }
  });

  test("admin can open settings in the admin shell", async ({ page }) => {
    test.setTimeout(60_000);
    await loginAsAdmin(page, "/admin/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByText("Applications open")).toBeVisible();
  });

  test("editor settings omit the newsletter signup section", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await loginAsEditor(page, "/dashboard/settings");
    await expect(page.getByText("Applications open")).toBeVisible();
    await expect(page.getByText("Newsletter signup")).toHaveCount(0);
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
      await page.getByLabel("Password", { exact: true }).fill(password);
      await submitLoginForm(page);
      await expect(page).toHaveURL(/\/en$/, { timeout: 20_000 });
    } finally {
      if (created.user?.id) {
        await admin.auth.admin.deleteUser(created.user.id);
      }
    }
  });
});
