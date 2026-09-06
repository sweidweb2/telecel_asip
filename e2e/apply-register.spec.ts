import { expect, test } from "@playwright/test";

import {
  e2eAdminClient,
  e2eSuffix,
  hasE2ECredentials,
  loginAsAdmin,
  waitForTurnstileReady,
} from "./helpers";

const REGISTER_SUCCESS = "Thank you — your interest has been registered.";
const APPLY_SUCCESS = "Thank you — your application has been submitted.";

test.describe.configure({ mode: "serial" });

test.describe("apply and register-interest", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Apply/register E2E requires real Supabase credentials.",
    );
  });

  test("register-interest submit creates a registration row", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const suffix = e2eSuffix();
    const email = `register.e2e.${suffix}@example.com`;
    const company = `E2E Register Co ${suffix}`;
    const admin = e2eAdminClient();

    try {
      await page.goto("/en/register-interest");
      await page.locator("#intake-fullName").fill("Register E2E");
      await page.locator("#intake-role").fill("Founder");
      await page.locator("#intake-email").fill(email);
      await page.locator("#intake-phone").fill("+233201234567");
      await page.locator("#intake-country").fill("Ghana");
      await page.locator("#intake-company").fill(company);
      await page.locator("#intake-company-country").fill("Ghana");
      await page.locator("#intake-sector").fill("Fintech");
      await page.getByLabel(/I agree that ASIP may store/i).click();

      await waitForTurnstileReady(page, {
        testId: "register-turnstile",
        submitName: "Submit interest",
      });
      await page.getByRole("button", { name: "Submit interest" }).click();
      await expect(
        page.locator("[data-sonner-toast]").filter({ hasText: REGISTER_SUCCESS }),
      ).toBeVisible({ timeout: 20_000 });

      const { count, error } = await admin
        .from("interest_registrations")
        .select("id", { count: "exact", head: true })
        .eq("email", email);
      if (error) throw error;
      expect(count).toBe(1);
    } finally {
      await admin.from("interest_registrations").delete().eq("email", email);
    }
  });

  test("apply submit creates an application when applications are open", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const suffix = e2eSuffix();
    const email = `apply.e2e.${suffix}@example.com`;
    const company = `E2E Apply Co ${suffix}`;
    const admin = e2eAdminClient();

    const { data: before } = await admin
      .from("site_settings")
      .select("open_applications, newsletter_signup_enabled")
      .eq("id", 1)
      .maybeSingle();
    const previousOpen = Boolean(before?.open_applications);
    const previousNewsletter = Boolean(before?.newsletter_signup_enabled);

    try {
      await admin
        .from("site_settings")
        .update({ open_applications: true })
        .eq("id", 1);

      await page.goto("/en/apply");
      await page.locator("#intake-fullName").fill("Apply E2E");
      await page.locator("#intake-role").fill("CEO");
      await page.locator("#intake-email").fill(email);
      await page.locator("#intake-phone").fill("+233201234567");
      await page.locator("#intake-country").fill("Ghana");
      await page
        .locator("#intake-linkedin")
        .fill("https://linkedin.com/in/applye2e");
      await page.locator("#intake-company").fill(company);
      await page
        .locator("#intake-website")
        .fill("https://applye2e.example.com");
      await page.locator("#intake-company-country").fill("Ghana");
      await page.locator("#intake-sector").fill("Health");
      await page
        .locator("#intake-problem")
        .fill(
          "Clinics lose patients to paper records. We digitise outpatient workflows so teams ship care faster across African cities.",
        );
      await page
        .locator("#intake-traction")
        .fill("40 clinics live, $25k MRR, two hospital pilots signed.");
      await page
        .locator("#intake-fit")
        .fill("Need customer intros and capital to expand into Francophone markets.");
      await page.getByLabel(/I agree that ASIP may store/i).click();

      await waitForTurnstileReady(page, {
        testId: "apply-turnstile",
        submitName: "Submit application",
      });
      await page.getByRole("button", { name: "Submit application" }).click();
      await expect(
        page.locator("[data-sonner-toast]").filter({ hasText: APPLY_SUCCESS }),
      ).toBeVisible({ timeout: 20_000 });

      const { count, error } = await admin
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("email", email);
      if (error) throw error;
      expect(count).toBe(1);
    } finally {
      await admin.from("applications").delete().eq("email", email);
      await admin
        .from("site_settings")
        .update({
          open_applications: previousOpen,
          newsletter_signup_enabled: previousNewsletter,
        })
        .eq("id", 1);
    }
  });

  test("navbar CTA follows open_applications setting", async ({ page }) => {
    test.setTimeout(120_000);
    const admin = e2eAdminClient();
    const { data: before } = await admin
      .from("site_settings")
      .select("open_applications, newsletter_signup_enabled")
      .eq("id", 1)
      .maybeSingle();
    const previousOpen = Boolean(before?.open_applications);
    const previousNewsletter = Boolean(before?.newsletter_signup_enabled);

    try {
      await loginAsAdmin(page, "/dashboard/settings");
      await expect(
        page.getByRole("heading", { name: /Settings/i }),
      ).toBeVisible();

      const appsSwitch = page.locator("#open-applications");
      const currentlyOpen = await appsSwitch.isChecked();
      if (currentlyOpen) {
        await appsSwitch.click();
      }
      await expect(appsSwitch).not.toBeChecked();
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(
        page.locator("[data-sonner-toast]").filter({ hasText: "Settings saved" }),
      ).toBeVisible({ timeout: 20_000 });

      await page.goto("/en");
      await expect(
        page
          .locator("header")
          .locator('a[href="/en/register-interest"]')
          .first(),
      ).toBeVisible({ timeout: 20_000 });

      await page.goto("/dashboard/settings");
      if (!(await appsSwitch.isChecked())) {
        await appsSwitch.click();
      }
      await expect(appsSwitch).toBeChecked();
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(
        page.locator("[data-sonner-toast]").filter({ hasText: "Settings saved" }),
      ).toBeVisible({ timeout: 20_000 });

      await page.goto("/en");
      await expect(
        page.locator("header").locator('a[href="/en/apply"]').first(),
      ).toBeVisible({ timeout: 20_000 });
    } finally {
      await admin
        .from("site_settings")
        .update({
          open_applications: previousOpen,
          newsletter_signup_enabled: previousNewsletter,
        })
        .eq("id", 1);
    }
  });
});
