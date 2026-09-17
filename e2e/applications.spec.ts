import { expect, test } from "@playwright/test";

import { e2eAdminClient, e2eAnonClient, e2eSuffix, hasE2ECredentials, loginAsEditor, submitLoginForm, adminListRow } from "./helpers";

test.describe.configure({ mode: "serial" });

test.describe("applications admin", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Applications E2E requires real Supabase credentials.",
    );
  });

  test("admin can search, edit, and delete an application", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const suffix = e2eSuffix();
    const email = `apps.admin.${suffix}@example.com`;
    const company = `Apps Co ${suffix}`;
    const admin = e2eAdminClient();

    const { data: inserted, error: insertError } = await admin
      .from("applications")
      .insert({
        full_name: "Apps Admin E2E",
        founder_role: "Founder",
        email,
        phone: "+233201234567",
        country: "Ghana",
        linkedin: "https://linkedin.com/in/appsadmin",
        company_name: company,
        website: "https://appsadmin.example.com",
        company_country: "Ghana",
        sector: "Fintech",
        problem_product:
          "SMEs lack credit. We underwrite inventory loans for African merchants in days.",
        traction: "100 merchants live and $30k GMV last quarter.",
        programme_fit: "Need intros to banks and regional operators.",
        consent: true,
        comms_opt_in: false,
      })
      .select("id")
      .single();
    if (insertError) throw insertError;

    try {
      await loginAsEditor(page, "/dashboard/applications");
      await page.getByLabel("Search applications").fill(email);
      await expect(page).toHaveURL(new RegExp(`search=apps\\.admin\\.${suffix}`), {
        timeout: 15_000,
      });
      const row = adminListRow(
        page,
        "View application from Apps Admin E2E",
      );
      await expect(row).toBeVisible({ timeout: 15_000 });

      await page.getByRole("button", { name: "Edit Apps Admin E2E" }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Startup").fill(`${company} edited`);
      await dialog.getByRole("button", { name: "Save changes" }).click();
      await expect(
        page
          .locator("[data-sonner-toast]")
          .filter({ hasText: "Application updated successfully." }),
      ).toBeVisible({ timeout: 20_000 });

      await page
        .getByRole("button", { name: /Delete Apps Admin E2E/ })
        .click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: /Delete/i })
        .click();
      await expect(
        page
          .locator("[data-sonner-toast]")
          .filter({ hasText: "Application deleted successfully." }),
      ).toBeVisible({ timeout: 20_000 });
      await expect(
        adminListRow(page, "View application from Apps Admin E2E"),
      ).toHaveCount(0);
    } finally {
      if (inserted?.id) {
        await admin.from("applications").delete().eq("id", inserted.id);
      }
      await admin.from("applications").delete().eq("email", email);
    }
  });

  test("viewer cannot open applications and RLS blocks table reads", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const suffix = e2eSuffix();
    const email = `apps.viewer.${suffix}@example.com`;
    const password = "Testpass1";
    const admin = e2eAdminClient();
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Apps Viewer" },
      app_metadata: { app_role: "viewer" },
    });
    if (error) throw error;

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fapplications");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await submitLoginForm(page);
      await expect(page).toHaveURL(/\/en$/, { timeout: 20_000 });

      const anon = e2eAnonClient();
      const { error: signInError } = await anon.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      const { data, error: listError } = await anon
        .from("applications")
        .select("id")
        .limit(5);
      expect(listError).toBeNull();
      expect(data ?? []).toEqual([]);
    } finally {
      if (created.user?.id) {
        await admin.auth.admin.deleteUser(created.user.id);
      }
    }
  });
});
