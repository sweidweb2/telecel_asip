import { expect, test } from "@playwright/test";

import { e2eSuffix } from "./helpers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.E2E_SEED_EMAIL ?? "asweid657@gmail.com";
const adminPassword = process.env.E2E_SEED_PASSWORD ?? "ali@1234";

function hasCredentials(): boolean {
  return Boolean(
    supabaseUrl &&
      anonKey &&
      serviceRoleKey &&
      !supabaseUrl.includes("placeholder") &&
      !anonKey.startsWith("placeholder"),
  );
}

const cmsSmokeRoutes = [
  {
    path: "/dashboard/events",
    heading: /Events/i,
    newHref: "/dashboard/events/new",
    field: "Name",
  },
  {
    path: "/dashboard/impact-metrics",
    heading: /Impact metrics/i,
    newHref: "/dashboard/impact-metrics/new",
    field: "Claim label",
  },
  {
    path: "/dashboard/founder-stories",
    heading: /Founder stories/i,
    newHref: "/dashboard/founder-stories/new",
    field: "Quote text",
  },
  {
    path: "/dashboard/registrations",
    heading: /Registrations/i,
    newHref: null,
    field: null,
  },
] as const;

test.describe("cms content smoke", () => {
  test.beforeEach(() => {
    test.skip(
      !hasCredentials(),
      "CMS smoke E2E requires real Supabase credentials.",
    );
  });

  for (const route of cmsSmokeRoutes) {
    test(`admin can open ${route.path}`, async ({ page }) => {
      test.setTimeout(60_000);
      const suffix = e2eSuffix();
      void suffix;

      await page.goto(`/en/login?next=${encodeURIComponent(route.path)}`);
      await page.getByLabel("Email").fill(adminEmail);
      await page.getByLabel("Password").fill(adminPassword);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(new RegExp(route.path.replace("/", "\\/")), {
        timeout: 20_000,
      });
      await expect(
        page.getByRole("heading", { name: route.heading }),
      ).toBeVisible();

      if (route.newHref) {
        await page.locator(`a[href="${route.newHref}"]`).first().click();
        await expect(page).toHaveURL(new RegExp(route.newHref.replace(/\//g, "\\/")), {
          timeout: 20_000,
        });
        if (route.field) {
          await expect(page.getByLabel(route.field, { exact: true })).toBeVisible();
        }
      }
    });
  }
});
