import { expect, test } from "@playwright/test";

import { e2eAdminClient, e2eSuffix, hasE2ECredentials, loginAsEditor, submitLoginForm, clickSaveChanges } from "./helpers";

test.describe.configure({ mode: "serial" });

test.describe("events cms", () => {
  test.beforeEach(() => {
    test.skip(!hasE2ECredentials(), "Events E2E requires real Supabase credentials.");
  });

  test("admin can create, edit, and delete an event", async ({ page }) => {
    test.setTimeout(120_000);
    const suffix = e2eSuffix();
    const name = `E2E Event ${suffix}`;
    const admin = e2eAdminClient();

    try {
      await loginAsEditor(page, "/dashboard/events");
      await page.locator('a[href="/dashboard/events/new"]').first().click();
      await expect(page).toHaveURL(/\/dashboard\/events\/new/, { timeout: 20_000 });

      await page.locator("#event-name").fill(name);
      await page.locator("#event-date").fill("2026-06-15");
      await page
        .getByRole("button", { name: /Fill form with dummy data/i })
        .click();
      await page.locator("#event-name").fill(name);
      await page.locator("#event-date").fill("2026-06-15");
      await expect(
        page.getByRole("button", { name: "Create event" }),
      ).toBeEnabled();
      await page.getByRole("button", { name: "Create event" }).click();
      await expect(
        page.locator("[data-sonner-toast]").filter({
          hasText: /Event created successfully/i,
        }),
      ).toBeVisible({ timeout: 20_000 });
      await expect(page).toHaveURL(/\/dashboard\/events\/[0-9a-f-]+/, {
        timeout: 20_000,
      });
      await page.getByLabel("Name").fill(`${name} edited`);
      await clickSaveChanges(page);
      await expect(
        page
          .locator("[data-sonner-toast]")
          .filter({ hasText: /Event updated successfully/i }),
      ).toBeVisible({ timeout: 20_000 });

      await page.getByRole("button", { name: "Delete" }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Delete event" })
        .click();
      await expect(page).toHaveURL(/\/dashboard\/events$/, { timeout: 20_000 });
    } finally {
      await admin.from("events").delete().ilike("name", `E2E Event ${suffix}%`);
    }
  });

  test("non-admin is redirected away from events", async ({ page }) => {
    test.setTimeout(60_000);
    const suffix = e2eSuffix();
    const email = `events.viewer.${suffix}@example.com`;
    const password = "Testpass1";
    const admin = e2eAdminClient();
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Events Viewer" },
      app_metadata: { app_role: "viewer" },
    });
    if (error) throw error;
    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fevents");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await submitLoginForm(page);
      await expect(page).toHaveURL(/\/en$/, { timeout: 20_000 });
    } finally {
      if (created.user?.id) await admin.auth.admin.deleteUser(created.user.id);
    }
  });
});
