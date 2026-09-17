import { expect, test } from "@playwright/test";
import { submitLoginForm } from "./helpers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const editorEmail = process.env.E2E_EDITOR_EMAIL ?? "gbitar@telecelglobal.com";
const editorPassword = process.env.E2E_EDITOR_PASSWORD ?? "password";

function hasCredentials(): boolean {
  return Boolean(
    supabaseUrl &&
      anonKey &&
      serviceRoleKey &&
      !supabaseUrl.includes("placeholder") &&
      !anonKey.startsWith("placeholder"),
  );
}

test.describe("applications inbox", () => {
  test.beforeEach(() => {
    test.skip(
      !hasCredentials(),
      "Applications E2E requires real Supabase credentials.",
    );
  });

  test("admin can open the applications list and inbox filters", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    await page.goto("/en/login?next=%2Fdashboard%2Fapplications");
    await page.getByLabel("Email").fill(editorEmail);
    await page.getByLabel("Password", { exact: true }).fill(editorPassword);
    await submitLoginForm(page);
    await expect(page).toHaveURL(/\/dashboard\/applications/, {
      timeout: 20_000,
    });

    await expect(
      page.getByRole("heading", { name: /Applications/i }),
    ).toBeVisible();

    await page.getByLabel("Inbox status").click();
    await page.getByRole("option", { name: "Unread" }).click();
    await expect(page).toHaveURL(/inboxStatus=unread/);
  });
});

test.describe("cohorts cms smoke", () => {
  test.beforeEach(() => {
    test.skip(
      !hasCredentials(),
      "Cohorts E2E requires real Supabase credentials.",
    );
  });

  test("admin can open cohorts list and new cohort form", async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto("/en/login?next=%2Fdashboard%2Fcohorts");
    await page.getByLabel("Email").fill(editorEmail);
    await page.getByLabel("Password", { exact: true }).fill(editorPassword);
    await submitLoginForm(page);
    await expect(page).toHaveURL(/\/dashboard\/cohorts/, { timeout: 20_000 });

    await expect(page.getByRole("heading", { name: /Cohorts/i })).toBeVisible();
    await page.locator('a[href="/dashboard/cohorts/new"]').first().click();
    await expect(page).toHaveURL(/\/dashboard\/cohorts\/new/, {
      timeout: 20_000,
    });
    await expect(page.getByLabel("Year")).toBeVisible();
    await expect(page.getByLabel("Public label")).toBeVisible();
  });
});
