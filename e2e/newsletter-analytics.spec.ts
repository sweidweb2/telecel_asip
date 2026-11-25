import { expect, test } from "@playwright/test";

import {
  hasE2ECredentials,
  loginAsAdmin,
  loginAsEditor,
} from "./helpers";

test.describe("newsletter signup e2e", () => {
  test(
    "Insights newsletter signup is hidden in phase 1",
    { tag: "@smoke" },
    async ({ page }) => {
      test.setTimeout(60_000);
      await page.goto("/en/insights");
      await expect(page.locator("#newsletter-email")).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Register for updates" }),
      ).toHaveCount(0);
    },
  );
});

test.describe("editor analytics and admin performance authz", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Analytics authz E2E requires real Supabase credentials.",
    );
  });

  // Split roles onto separate tests — swapping storageState mid-page often
  // aborts the next navigation (net::ERR_ABORTED).
  test(
    "editor can open analytics",
    { tag: "@smoke" },
    async ({ page }) => {
      await loginAsEditor(page, "/dashboard/analytics");
      await expect(
        page.getByRole("heading", { name: /analytics/i }),
      ).toBeVisible();
    },
  );

  test("admin cannot open editor CMS routes", async ({ page }) => {
    test.setTimeout(60_000);
    await loginAsAdmin(page, "/admin/users");
    await page.goto("/dashboard/blogs");
    await expect(page).toHaveURL(/\/admin/, { timeout: 20_000 });
  });
});
