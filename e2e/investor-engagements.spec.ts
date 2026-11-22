import { expect, test } from "@playwright/test";

import {
  adminListRow,
  e2eAdminClient,
  e2eAnonClient,
  e2eSuffix,
  hasE2ECredentials,
  loginAsEditor,
  submitLoginForm,
} from "./helpers";

test.describe("investor engagements admin", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Investor engagements E2E requires real Supabase credentials.",
    );
  });

  test("admin can search, edit, and delete an investor engagement", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const suffix = e2eSuffix();
    const email = `inv.engage.${suffix}@example.com`;
    const organization = `Engage Org ${suffix}`;
    const admin = e2eAdminClient();

    const { data: inserted, error: insertError } = await admin
      .from("investor_engagements")
      .insert({
        full_name: "Inv Engage E2E",
        email,
        organization,
        investor_type: "vc",
        stages: ["seed"],
        ticket_size: "50k_250k",
        sectors: ["FinTech"],
        geographies: ["West Africa"],
        engagement_intent: "introductions",
        thesis:
          "Looking for seed-stage African FinTech founders with clear unit economics and regional expansion plans.",
        consent: true,
        comms_opt_in: false,
      })
      .select("id")
      .single();
    if (insertError) throw insertError;

    try {
      await loginAsEditor(page, "/dashboard/investor-engagements");
      await page.getByLabel("Search investor engagements").fill(email);
      await expect(page).toHaveURL(
        new RegExp(`search=inv\\.engage\\.${suffix}`),
        { timeout: 15_000 },
      );
      const row = adminListRow(
        page,
        "View investor engagement from Inv Engage E2E",
      );
      await expect(row).toBeVisible({ timeout: 15_000 });

      await page.getByRole("button", { name: "Edit Inv Engage E2E" }).click();
      const dialog = page.getByRole("dialog");
      await dialog
        .getByLabel("Organization", { exact: true })
        .fill(`${organization} edited`);
      await dialog.getByRole("button", { name: "Save changes" }).click();
      await expect(
        page
          .locator("[data-sonner-toast]")
          .filter({ hasText: "Investor engagement updated successfully." }),
      ).toBeVisible({ timeout: 20_000 });

      await page
        .getByRole("button", { name: /Delete Inv Engage E2E/ })
        .click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: /Delete/i })
        .click();
      await expect(
        page
          .locator("[data-sonner-toast]")
          .filter({ hasText: "Investor engagement deleted successfully." }),
      ).toBeVisible({ timeout: 20_000 });
      await expect(
        adminListRow(page, "View investor engagement from Inv Engage E2E"),
      ).toHaveCount(0);
    } finally {
      if (inserted?.id) {
        await admin.from("investor_engagements").delete().eq("id", inserted.id);
      }
      await admin.from("investor_engagements").delete().eq("email", email);
    }
  });

  test("viewer cannot open investor engagements and RLS blocks reads", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const suffix = e2eSuffix();
    const email = `inv.engage.viewer.${suffix}@example.com`;
    const password = "Testpass1";
    const admin = e2eAdminClient();
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Inv Engage Viewer" },
      app_metadata: { app_role: "viewer" },
    });
    if (error) throw error;

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Finvestor-engagements");
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
        .from("investor_engagements")
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
