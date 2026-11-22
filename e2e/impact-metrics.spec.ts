import { expect, test } from "@playwright/test";

import { e2eAdminClient, e2eEditorEmail, e2eSuffix, hasE2ECredentials, loginAsEditor, clickSaveChanges } from "./helpers";

async function seedEvidence(primarySource: string): Promise<string> {
  const admin = e2eAdminClient();
  const { data: users, error: userError } =
    await admin.auth.admin.listUsers({ perPage: 200 });
  if (userError) throw userError;
  const seed = users.users.find(
    (user) => user.email?.toLowerCase() === e2eEditorEmail.toLowerCase(),
  );
  if (!seed?.id) {
    throw new Error(`Seed editor ${e2eEditorEmail} not found for evidence owner.`);
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
      await loginAsEditor(page, "/dashboard/impact-metrics");
      await page
        .locator('a[href="/dashboard/impact-metrics/new"]')
        .first()
        .click();
      await expect(page).toHaveURL(/\/dashboard\/impact-metrics\/new/, {
        timeout: 20_000,
      });

      await page.getByLabel("Claim label").fill(claim);
      await page.locator("#impact-value").fill("42");
      await page.getByLabel("Unit").fill("%");
      await page.getByRole("tab", { name: /Period/i }).click();
      await page.getByLabel("Period start").fill("2024-01-01");
      await page.getByLabel("Period end").fill("2024-12-31");

      await page.getByRole("combobox", { name: "Evidence record" }).click();
      await page
        .getByLabel("Search evidence by source…")
        .fill(evidenceSource);
      await expect(
        page.getByRole("option", { name: new RegExp(evidenceSource) }),
      ).toBeVisible({ timeout: 20_000 });
      await page
        .getByRole("option", { name: new RegExp(evidenceSource) })
        .click();

      await page
        .getByRole("button", { name: /Fill form with dummy data/i })
        .click();
      await page.getByRole("tab", { name: /Claim/i }).click();
      await page.getByLabel("Claim label").fill(claim);
      await page.locator("#impact-value").fill("42");
      await page.getByLabel("Unit").fill("%");
      await page.getByRole("tab", { name: /Period/i }).click();
      await page.getByLabel("Period start").fill("2024-01-01");
      await page.getByLabel("Period end").fill("2024-12-31");
      await page.getByRole("combobox", { name: "Evidence record" }).click();
      await page
        .getByLabel("Search evidence by source…")
        .fill(evidenceSource);
      await page
        .getByRole("option", { name: new RegExp(evidenceSource) })
        .click();

      await page.getByRole("button", { name: "Create metric" }).click();
      await expect(page).toHaveURL(/\/dashboard\/impact-metrics\/[0-9a-f-]+/, {
        timeout: 20_000,
      });

      await page.getByLabel("Claim label").fill(`${claim} edited`);
      await clickSaveChanges(page);
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

  test(
    "verified homepage_module_02 metric appears on the home strip",
    { tag: "@writes" },
    async ({ page }) => {
      test.setTimeout(120_000);
      const suffix = e2eSuffix();
      const claim = `E2E Home Impact ${suffix}`;
      const evidenceSource = `E2E Home Impact evidence ${suffix}`;
      const admin = e2eAdminClient();
      const evidenceId = await seedEvidence(evidenceSource);

      try {
        await loginAsEditor(page, "/dashboard/impact-metrics/new");
        await page.getByLabel("Claim label").fill(claim);
        await page.locator("#impact-value").fill("77");
        await page.getByLabel("Unit").fill("%");
        await page.getByRole("tab", { name: /Period/i }).click();
        await page.getByLabel("Period start").fill("2024-01-01");
        await page.getByLabel("Period end").fill("2024-12-31");

        await page.getByRole("combobox", { name: "Evidence record" }).click();
        await page
          .getByLabel("Search evidence by source…")
          .fill(evidenceSource);
        await page
          .getByRole("option", { name: new RegExp(evidenceSource) })
          .click();

        await page.getByRole("tab", { name: /Publishing/i }).click();
        await page.getByLabel("Publish status").click();
        await page.getByRole("option", { name: "Verified" }).click();
        await page.getByLabel("Display locations").fill("homepage_module_02");

        await page.getByRole("button", { name: "Create metric" }).click();
        await expect(page).toHaveURL(/\/dashboard\/impact-metrics\/[0-9a-f-]+/, {
          timeout: 20_000,
        });

        await page.goto("/en");
        await expect(page.locator("#impact-years")).toContainText(claim, {
          timeout: 20_000,
        });
      } finally {
        await admin
          .from("impact_metrics")
          .delete()
          .ilike("claim_label", `E2E Home Impact ${suffix}%`);
        await admin.from("evidence_records").delete().eq("id", evidenceId);
      }
    },
  );
});
