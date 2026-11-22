import { expect, test } from "@playwright/test";

import {
  e2eAdminClient,
  e2eSuffix,
  hasE2ECredentials,
  loginAsEditor,
} from "./helpers";

test.describe("blogs cms", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Blog E2E requires real Supabase credentials.",
    );
  });

  test(
    "admin can create draft then publish; public sees published only",
    { tag: "@writes" },
    async ({ page }) => {
      test.setTimeout(120_000);
      const suffix = e2eSuffix();
      const title = `E2E Blog ${suffix}`;
      const slug = `e2e-blog-${suffix}`;
      const admin = e2eAdminClient();

      try {
        await loginAsEditor(page, "/dashboard/blogs/new");

        await page.getByLabel("Title", { exact: true }).fill(title);
        await page.getByLabel("Slug").fill(slug);
        await page
          .getByLabel("Summary")
          .fill("E2E summary for the insights blog CMS coverage.");
        await page.getByLabel("Author", { exact: true }).fill("E2E Author");
        await page.getByRole("button", { name: "Founder Stories" }).click();
        await page.locator(".ProseMirror").click();
        await page.keyboard.type(
          "This is the E2E body content for a published insight article.",
        );
        await page.getByRole("button", { name: "Create blog" }).click();

        const createdDialog = page.getByRole("dialog");
        await expect(
          createdDialog.getByRole("heading", { name: "Blog created" }),
        ).toBeVisible({ timeout: 20_000 });
        await createdDialog
          .getByRole("button", { name: "Edit this post" })
          .click();
        await expect(page).toHaveURL(/\/dashboard\/blogs\/[0-9a-f-]+/, {
          timeout: 20_000,
        });

        // Draft must not be publicly readable.
        // Next.js App Router can serve not-found UI with HTTP 200 in dev — assert content.
        const { data: draftRow, error: draftLookupError } = await admin
          .from("blogs")
          .select("status")
          .eq("slug", slug)
          .maybeSingle();
        if (draftLookupError) throw draftLookupError;
        expect(draftRow?.status).toBe("draft");

        await page.goto(`/en/insights/${slug}`);
        await expect(page.getByText("Page not found")).toBeVisible({
          timeout: 20_000,
        });

        await page.goto("/dashboard/blogs");
        await page.getByRole("link", { name: new RegExp(title) }).click();
        await page
          .getByRole("checkbox", { name: "Published (visible on Insights)" })
          .click();
        await page.getByRole("button", { name: "Save changes" }).click();
        await expect(
          page.locator("[data-sonner-toast]").filter({
            hasText: "Blog updated successfully.",
          }),
        ).toBeVisible({ timeout: 20_000 });

        await page.goto(`/en/insights/${slug}`);
        await expect(page.getByRole("heading", { name: title })).toBeVisible({
          timeout: 20_000,
        });
      } finally {
        await admin.from("blogs").delete().eq("slug", slug);
      }
    },
  );
});
