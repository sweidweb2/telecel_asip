import { expect, test } from "@playwright/test";

import {
  hasE2ECredentials,
  loginAsAdmin,
  loginAsEditor,
} from "./helpers";

test.describe("admin catalog", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Admin catalog E2E requires real Supabase credentials.",
    );
  });

  test("admin can open catalog and switch CMS reflection guides", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await loginAsAdmin(page, "/admin/catalog");
    await expect(page.getByRole("main", { name: "Catalog" })).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByRole("navigation", { name: "CMS pages" }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: /Where portfolio startups appear/i }),
    ).toBeVisible();
    await expect(page.getByText("/{locale}/founders").first()).toBeVisible();

    await page.getByRole("link", { name: "Blogs" }).click();
    await expect(page).toHaveURL(/resource=blogs/, { timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: /Where blogs \/ insights appear/i }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("editor cannot open admin catalog", async ({ page }) => {
    test.setTimeout(60_000);
    await loginAsEditor(page, "/dashboard");
    await page.goto("/admin/catalog");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
  });
});
