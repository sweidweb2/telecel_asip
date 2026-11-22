import { expect, test } from "@playwright/test";

import {
  clickSaveChanges,
  e2eAdminClient,
  e2eSuffix,
  hasE2ECredentials,
  loginAsEditor,
} from "./helpers";

test.describe("cohorts cms", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Cohorts E2E requires real Supabase credentials.",
    );
  });

  test(
    "admin can create, edit, and delete a cohort",
    { tag: "@writes" },
    async ({ page }) => {
      test.setTimeout(90_000);
      const suffix = e2eSuffix();
      const label = `E2E Cohort ${suffix}`;
      const admin = e2eAdminClient();

      try {
        await loginAsEditor(page, "/dashboard/cohorts/new");
        await expect(
          page.getByRole("heading", { name: "New cohort" }),
        ).toBeVisible({ timeout: 15_000 });

        await page
          .getByRole("button", { name: /Fill form with dummy data/i })
          .click();
        await page.getByLabel("Year").fill("2026");
        await page.getByLabel("Public label").fill(label);
        await page.getByLabel("Program start").fill("2026-01-01");
        await page.getByLabel("Program end").fill("2026-12-31");
        await page.getByRole("button", { name: "Create cohort" }).click();

        await expect(page).toHaveURL(/\/dashboard\/cohorts\/[0-9a-f-]+/, {
          timeout: 15_000,
        });
        await page.getByLabel("Public label").fill(`${label} edited`);
        await clickSaveChanges(page);
        await expect(
          page
            .locator("[data-sonner-toast]")
            .filter({ hasText: /Cohort updated successfully/i }),
        ).toBeVisible({ timeout: 15_000 });

        await page.getByRole("button", { name: "Delete" }).click();
        await page
          .getByRole("alertdialog")
          .getByRole("button", { name: "Delete cohort" })
          .click();
        await expect(page).toHaveURL(/\/dashboard\/cohorts$/, {
          timeout: 15_000,
        });
      } finally {
        await admin
          .from("cohorts")
          .delete()
          .ilike("public_label", `E2E Cohort ${suffix}%`);
      }
    },
  );

  /** Read-only — does not insert cohorts (safe on shared/prod DB). */
  test(
    "programme page renders public cohort chapters",
    { tag: "@smoke" },
    async ({ page }) => {
      await page.goto("/en/programme");
      await expect(page.locator("h1").first()).toBeVisible({ timeout: 15_000 });
      await expect(page.locator("header").first()).toBeVisible();
      await expect(page.locator("footer").first()).toBeVisible();
    },
  );
});
