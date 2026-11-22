import { expect, test } from "@playwright/test";

import {
  hasE2ECredentials,
  loginAsAdmin,
  loginAsEditor,
} from "./helpers";

test.describe("staff overview pages", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Staff overview E2E requires real Supabase credentials.",
    );
  });

  test(
    "editor dashboard shows waiting inbox and section launchers",
    { tag: "@smoke" },
    async ({ page }) => {
      test.setTimeout(60_000);
      await loginAsEditor(page, "/dashboard");
      await expect(page.getByRole("main", { name: "Dashboard" })).toBeVisible({
        timeout: 20_000,
      });
      await expect(
        page.getByRole("heading", { name: "What’s waiting" }),
      ).toBeVisible();
      await expect(
        page.getByText("Unread items in the intake pipeline."),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /Applications/i }).first(),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /^Startups/i }).first(),
      ).toBeVisible();
    },
  );

  test("admin overview lists ops shortcuts including catalog", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await loginAsAdmin(page, "/admin");
    await expect(page.getByRole("main", { name: "Overview" })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("link", { name: "Users" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Performance" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Backup" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Catalog" })).toBeVisible();

    await page.getByRole("link", { name: "Catalog" }).click();
    await expect(page).toHaveURL(/\/admin\/catalog/, { timeout: 15_000 });
  });
});
