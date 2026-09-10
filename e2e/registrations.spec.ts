import { expect, test } from "@playwright/test";

import { e2eAdminClient, e2eAnonClient, e2eSuffix, hasE2ECredentials, loginAsEditor, submitLoginForm } from "./helpers";

test.describe.configure({ mode: "serial" });

test.describe("registrations admin", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Registrations E2E requires real Supabase credentials.",
    );
  });

  test("admin can search, edit, and delete a registration", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const suffix = e2eSuffix();
    const email = `regs.admin.${suffix}@example.com`;
    const company = `Regs Co ${suffix}`;
    const admin = e2eAdminClient();

    const { data: inserted, error: insertError } = await admin
      .from("interest_registrations")
      .insert({
        full_name: "Regs Admin E2E",
        founder_role: "Founder",
        email,
        phone: "+233201234567",
        country: "Ghana",
        company_name: company,
        company_country: "Ghana",
        sector: "Edtech",
        consent: true,
        comms_opt_in: false,
      })
      .select("id")
      .single();
    if (insertError) throw insertError;

    try {
      await loginAsEditor(page, "/dashboard/registrations");
      await page.getByLabel("Search registrations").fill(email);
      await expect(page).toHaveURL(new RegExp(`search=regs\\.admin\\.${suffix}`), {
        timeout: 15_000,
      });
      const row = page.getByRole("row").filter({ hasText: email });
      await expect(row).toBeVisible();

      await row.getByRole("button", { name: "Edit Regs Admin E2E" }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Company").fill(`${company} edited`);
      await dialog.getByRole("button", { name: "Save changes" }).click();
      await expect(
        page
          .locator("[data-sonner-toast]")
          .filter({ hasText: "Registration updated successfully." }),
      ).toBeVisible({ timeout: 20_000 });

      await page
        .getByRole("row")
        .filter({ hasText: email })
        .getByRole("button", { name: /Delete Regs Admin E2E/ })
        .click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: /Delete/i })
        .click();
      await expect(
        page
          .locator("[data-sonner-toast]")
          .filter({ hasText: "Registration deleted successfully." }),
      ).toBeVisible({ timeout: 20_000 });
      await expect(page.getByRole("row").filter({ hasText: email })).toHaveCount(
        0,
      );
    } finally {
      if (inserted?.id) {
        await admin.from("interest_registrations").delete().eq("id", inserted.id);
      }
      await admin.from("interest_registrations").delete().eq("email", email);
    }
  });

  test("viewer cannot open registrations and RLS blocks reads", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const suffix = e2eSuffix();
    const email = `regs.viewer.${suffix}@example.com`;
    const password = "Testpass1";
    const admin = e2eAdminClient();
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Regs Viewer" },
      app_metadata: { app_role: "viewer" },
    });
    if (error) throw error;

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fregistrations");
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
        .from("interest_registrations")
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
