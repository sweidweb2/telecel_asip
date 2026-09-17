import { expect, test } from "@playwright/test";

import { e2eEditorEmail, e2eEditorPassword, hasE2ECredentials, submitLoginForm } from "./helpers";

/**
 * Lightweight open-list smoke for inbox-style routes that are not covered by
 * full CRUD specs. Events / impact / founder stories live in dedicated files.
 */
test.describe("cms content smoke", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "CMS smoke E2E requires real Supabase credentials.",
    );
  });

  test("admin can open registrations list", async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto("/en/login?next=%2Fdashboard%2Fregistrations");
    await page.getByLabel("Email").fill(e2eEditorEmail);
    await page.getByLabel("Password", { exact: true }).fill(e2eEditorPassword);
    await submitLoginForm(page);
    await expect(page).toHaveURL(/\/dashboard\/registrations/, {
      timeout: 20_000,
    });
    await expect(
      page.getByRole("heading", { name: /Registrations/i }),
    ).toBeVisible();
  });
});
