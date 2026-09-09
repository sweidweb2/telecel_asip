import { expect, test } from "@playwright/test";

import {
  e2eAdminClient,
  e2eAdminEmail,
  e2eSuffix,
  hasE2ECredentials,
  loginAsAdmin,
} from "./helpers";

test.describe.configure({ mode: "serial" });

async function seedEvidence(primarySource: string): Promise<string> {
  const admin = e2eAdminClient();
  const { data: users, error: userError } =
    await admin.auth.admin.listUsers({ perPage: 200 });
  if (userError) throw userError;
  const seed = users.users.find(
    (user) => user.email?.toLowerCase() === e2eAdminEmail.toLowerCase(),
  );
  if (!seed?.id) {
    throw new Error(`Seed admin ${e2eAdminEmail} not found for evidence owner.`);
  }

  const { data, error } = await admin
    .from("evidence_records")
    .insert({
      primary_source: primarySource,
      measurement_period_start: "2024-01-01",
      measurement_period_end: "2024-12-31",
      owner_id: seed.id,
      status: "verified",
      last_verified_date: "2025-01-15",
      permission: "public",
      review_date: "2025-01-20",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

test.describe("impact metrics cms", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Impact metrics E2E requires real Supabase credentials.",
    );
  });

  test("admin can create, edit, and delete an impact metric", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const suffix = e2eSuffix();
    const claim = `E2E Impact ${suffix}`;
    const evidenceSource = `E2E Impact evidence ${suffix}`;
    const admin = e2eAdminClient();
    const evidenceId = await seedEvidence(evidenceSource);

    try {
      await loginAsAdmin(page, "/dashboard/impact-metrics");
      await page
        .locator('a[href="/dashboard/impact-metrics/new"]')
        .first()
        .click();
      await expect(page).toHaveURL(/\/dashboard\/impact-metrics\/new/, {
        timeout: 20_000,
      });

      await page.getByLabel("Claim label").fill(claim);
      await page.getByLabel("Value").fill("42");
      await page.getByLabel("Unit").fill("%");
      await page.getByLabel("Period start").fill("2024-01-01");
      await page.getByLabel("Period end").fill("2024-12-31");

      await page.getByLabel("Search evidence records").fill(evidenceSource);
      await page.getByRole("combobox", { name: "Evidence record" }).click();
      await expect(
        page.getByRole("option", { name: new RegExp(evidenceSource) }),
      ).toBeVisible({ timeout: 20_000 });
      await page
        .getByRole("option", { name: new RegExp(evidenceSource) })
        .click();

      await page.getByRole("button", { name: "Create metric" }).click();
      await expect(page).toHaveURL(/\/dashboard\/impact-metrics\/[0-9a-f-]+/, {
        timeout: 20_000,
      });

      await page.getByLabel("Claim label").fill(`${claim} edited`);
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(
        page.locator("[data-sonner-toast]").filter({
          hasText: /Impact metric updated successfully/i,
        }),
      ).toBeVisible({ timeout: 20_000 });

      await page.getByRole("button", { name: "Delete" }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Delete metric" })
        .click();
      await expect(page).toHaveURL(/\/dashboard\/impact-metrics$/, {
        timeout: 20_000,
      });
    } finally {
      await admin
        .from("impact_metrics")
        .delete()
        .ilike("claim_label", `E2E Impact ${suffix}%`);
      await admin.from("evidence_records").delete().eq("id", evidenceId);
    }
  });

  test("non-admin is redirected away from impact metrics", async ({ page }) => {
    test.setTimeout(60_000);
    const suffix = e2eSuffix();
    const email = `impact.viewer.${suffix}@example.com`;
    const password = "Testpass1";
    const admin = e2eAdminClient();
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Impact Viewer" },
      app_metadata: { app_role: "viewer" },
    });
    if (error) throw error;
    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fimpact-metrics");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/en$/, { timeout: 20_000 });
    } finally {
      if (created.user?.id) await admin.auth.admin.deleteUser(created.user.id);
    }
  });
});
