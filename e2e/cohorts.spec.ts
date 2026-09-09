import { expect, test } from "@playwright/test";

import { e2eAdminClient, e2eSuffix, hasE2ECredentials, loginAsAdmin, submitLoginForm } from "./helpers";

test.describe.configure({ mode: "serial" });

test.describe("cohorts cms", () => {
  test.beforeEach(() => {
    test.skip(!hasE2ECredentials(), "Cohorts E2E requires real Supabase credentials.");
  });

  test("admin can create, edit, and delete a cohort", async ({ page }) => {
    test.setTimeout(120_000);
    const suffix = e2eSuffix();
    const label = `E2E Cohort ${suffix}`;
    const admin = e2eAdminClient();

    try {
      await loginAsAdmin(page, "/dashboard/cohorts");
      await page.locator('a[href="/dashboard/cohorts/new"]').first().click();
      await expect(page).toHaveURL(/\/dashboard\/cohorts\/new/, { timeout: 20_000 });

      await page.getByLabel("Year").fill("2026");
      await page.getByLabel("Public label").fill(label);
      await page.getByLabel("Programme start").fill("2026-01-01");
      await page.getByLabel("Programme end").fill("2026-12-31");
      await page.getByRole("button", { name: "Create cohort" }).click();

      await expect(page).toHaveURL(/\/dashboard\/cohorts\/[0-9a-f-]+/, {
        timeout: 20_000,
      });
      await page.getByLabel("Public label").fill(`${label} edited`);
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(
        page
          .locator("[data-sonner-toast]")
          .filter({ hasText: /Cohort updated successfully/i }),
      ).toBeVisible({ timeout: 20_000 });

      await page.getByRole("button", { name: "Delete" }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Delete cohort" })
        .click();
      await expect(page).toHaveURL(/\/dashboard\/cohorts$/, { timeout: 20_000 });
    } finally {
      await admin.from("cohorts").delete().ilike("public_label", `E2E Cohort ${suffix}%`);
    }
  });

  test("non-admin is redirected away from cohorts", async ({ page }) => {
    test.setTimeout(60_000);
    const suffix = e2eSuffix();
    const email = `cohorts.viewer.${suffix}@example.com`;
    const password = "Testpass1";
    const admin = e2eAdminClient();
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Cohorts Viewer" },
      app_metadata: { app_role: "viewer" },
    });
    if (error) throw error;
    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fcohorts");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await submitLoginForm(page);
      await expect(page).toHaveURL(/\/en$/, { timeout: 20_000 });
    } finally {
      if (created.user?.id) await admin.auth.admin.deleteUser(created.user.id);
    }
  });
});
