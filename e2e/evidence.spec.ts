import { expect, test } from "@playwright/test";

import {
  e2eAdminClient,
  e2eSuffix,
  hasE2ECredentials,
  loginAsEditor,
  clickSaveChanges,
} from "./helpers";

test.describe("evidence cms", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Evidence E2E requires real Supabase credentials.",
    );
  });

  test("admin can create, edit, and delete an evidence record", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const suffix = e2eSuffix();
    const primarySource = `E2E Evidence source ${suffix}`;
    const editedSource = `${primarySource} edited`;
    const admin = e2eAdminClient();

    try {
      await loginAsEditor(page, "/dashboard/evidence");

      await page.locator('a[href="/dashboard/evidence/new"]').first().click();
      await expect(page).toHaveURL(/\/dashboard\/evidence\/new/, {
        timeout: 20_000,
      });

      // Load owners before filling so async option fetch cannot race the form.
      await page.getByRole("combobox", { name: "Owner" }).click();
      await expect(page.getByRole("option").first()).toBeVisible({
        timeout: 20_000,
      });
      await page.getByRole("option").first().click();

      await page.getByLabel("Primary source").fill(primarySource);
      await page.getByRole("tab", { name: /Period/i }).click();
      await page.getByLabel("Period start").fill("2024-01-01");
      await page.getByLabel("Period end").fill("2024-12-31");
      await page.getByRole("tab", { name: /Governance/i }).click();
      await page.getByLabel("Last verified").fill("2025-01-15");
      await page.getByLabel("Review date").fill("2025-01-20");

      await page.getByRole("button", { name: "Create evidence" }).click();
      await expect(page).toHaveURL(/\/dashboard\/evidence\/[0-9a-f-]+/, {
        timeout: 20_000,
      });

      await page.getByLabel("Primary source").fill(editedSource);
      await clickSaveChanges(page);
      await expect(
        page.locator("[data-sonner-toast]").filter({
          hasText: /Evidence record updated successfully/i,
        }),
      ).toBeVisible({ timeout: 20_000 });

      await page.getByRole("button", { name: "Delete" }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Delete evidence" })
        .click();
      await expect(page).toHaveURL(/\/dashboard\/evidence$/, {
        timeout: 20_000,
      });
    } finally {
      await admin
        .from("evidence_records")
        .delete()
        .ilike("primary_source", `E2E Evidence source ${suffix}%`);
    }
  });
});
