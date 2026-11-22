import { expect, test } from "@playwright/test";

import {
  e2eAdminClient,
  hasE2ECredentials,
  loginAsAdmin,
  loginAsEditor,
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
    await expect(
      page.getByText("Applications open", { exact: true }),
    ).toBeVisible();
  });

  test(
    "editor settings omit the newsletter signup section",
    { tag: "@smoke" },
    async ({ page }) => {
      test.setTimeout(60_000);
      await loginAsEditor(page, "/dashboard/settings");
      await expect(
        page.getByText("Applications open", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("Newsletter signup")).toHaveCount(0);
    },
  );

});
