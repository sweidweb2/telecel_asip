import { expect, test, type Page } from "@playwright/test";

import { e2eAdminClient, e2eSuffix, hasE2ECredentials, loginAsAdmin, waitForTurnstileReady, submitLoginForm } from "./helpers";

const REGISTER_SUCCESS = "Thank you - your interest has been registered.";
const APPLY_SUCCESS = "Thank you - your application has been submitted.";

test.describe.configure({ mode: "serial" });

async function createViewerAndSignIn(
  page: Page,
  nextPath: string,
): Promise<{ email: string; userId: string; password: string }> {
  const suffix = e2eSuffix();
  const email = `intake.viewer.${suffix}@example.com`;
  const password = "Testpass1";
  const admin = e2eAdminClient();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Intake Viewer" },
    app_metadata: { app_role: "viewer" },
  });
  if (error) throw error;
  if (!created.user?.id) throw new Error("Viewer create returned no user id");

  await page.context().clearCookies();
  await page.goto(`/en/login?next=${encodeURIComponent(nextPath)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await submitLoginForm(page);
  await expect(page).toHaveURL(new RegExp(nextPath.replace(/\//g, "\\/")), {
    timeout: 20_000,
  });

  return { email, userId: created.user.id, password };
}

/** Flip Applications open via Settings so Next cache tags revalidate. */
async function setApplicationsOpenViaSettings(
  page: Page,
  open: boolean,
): Promise<void> {
  await loginAsAdmin(page, "/dashboard/settings");
  const appsSwitch = page.locator("#open-applications");
  const currentlyOpen = await appsSwitch.isChecked();
  if (currentlyOpen === open) return;
  await appsSwitch.click();
  await expect(appsSwitch).toBeChecked({ checked: open });
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.locator("[data-sonner-toast]").filter({ hasText: "Settings saved" }),
  ).toBeVisible({ timeout: 20_000 });
}

test.describe("apply and register-interest", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Apply/register E2E requires real Supabase credentials.",
    );
  });

  test("anonymous visitors see a sign-in gate on register-interest when closed", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const admin = e2eAdminClient();
    const { data: before } = await admin
      .from("site_settings")
      .select("open_applications, newsletter_signup_enabled")
      .eq("id", 1)
      .maybeSingle();
    const previousOpen = Boolean(before?.open_applications);
    const previousNewsletter = Boolean(before?.newsletter_signup_enabled);

    try {
      await setApplicationsOpenViaSettings(page, false);
      await page.context().clearCookies();
      await page.goto("/en/register-interest");
      await expect(
        page.getByRole("heading", { name: /Sign in to register interest/i }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
      await expect(page.locator("#intake-fullName")).toHaveCount(0);
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

  test("register-interest submit creates a registration row when closed", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const suffix = e2eSuffix();
    const company = `E2E Register Co ${suffix}`;
    const admin = e2eAdminClient();
    let userId = "";
    let email = "";

    const { data: before } = await admin
      .from("site_settings")
      .select("open_applications, newsletter_signup_enabled")
      .eq("id", 1)
      .maybeSingle();
    const previousOpen = Boolean(before?.open_applications);
    const previousNewsletter = Boolean(before?.newsletter_signup_enabled);

    try {
      await setApplicationsOpenViaSettings(page, false);
      const viewer = await createViewerAndSignIn(
        page,
        "/en/register-interest",
      );
      userId = viewer.userId;
      email = viewer.email;

      await page.locator("#intake-fullName").fill("Register E2E");
      await page.locator("#intake-role").fill("Founder");
      await page.locator("#intake-email").fill(email);
      await page.locator("#intake-phone").fill("+233201234567");
      await page.locator("#intake-country").fill("Ghana");
      await page.locator("#intake-company").fill(company);
      await page.locator("#intake-company-country").fill("Ghana");
      await page.locator("#intake-sector").fill("Fintech");
      await page
        .getByRole("checkbox", { name: /I agree that ASIP may store/i })
        .click();

      await waitForTurnstileReady(page, {
        testId: "register-turnstile",
        submitName: "Submit interest",
      });
      await page.getByRole("button", { name: "Submit interest" }).click();
      await expect(
        page.getByRole("heading", { name: "Thank you" }),
      ).toBeVisible({ timeout: 20_000 });
      await expect(page.getByText(REGISTER_SUCCESS)).toBeVisible();

      const { count, error } = await admin
        .from("interest_registrations")
        .select("id", { count: "exact", head: true })
        .eq("email", email);
      if (error) throw error;
      expect(count).toBe(1);
    } finally {
      if (email) {
        await admin.from("interest_registrations").delete().eq("email", email);
      }
      if (userId) await admin.auth.admin.deleteUser(userId);
      await admin
        .from("site_settings")
        .update({
          open_applications: previousOpen,
          newsletter_signup_enabled: previousNewsletter,
        })
        .eq("id", 1);
    }
  });

  test("apply submit creates an application when applications are open", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const suffix = e2eSuffix();
    const company = `E2E Apply Co ${suffix}`;
    const admin = e2eAdminClient();
    let userId = "";
    let email = "";

    const { data: before } = await admin
      .from("site_settings")
      .select("open_applications, newsletter_signup_enabled")
      .eq("id", 1)
      .maybeSingle();
    const previousOpen = Boolean(before?.open_applications);
    const previousNewsletter = Boolean(before?.newsletter_signup_enabled);

    try {
      await setApplicationsOpenViaSettings(page, true);
      const viewer = await createViewerAndSignIn(page, "/en/apply");
      userId = viewer.userId;
      email = viewer.email;

      await page.locator("#intake-fullName").fill("Apply E2E");
      await page.locator("#intake-role").fill("CEO");
      await page.locator("#intake-email").fill(email);
      await page.locator("#intake-phone").fill("+233201234567");
      await page.locator("#intake-country").fill("Ghana");
      await page.locator("#intake-company").fill(company);
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
        .fill(
          "Need customer intros and capital to expand into Francophone markets.",
        );
      await page
        .getByRole("checkbox", { name: /I agree that ASIP may store/i })
        .click();

      await waitForTurnstileReady(page, {
        testId: "apply-turnstile",
        submitName: "Submit application",
      });
      await page.getByRole("button", { name: "Submit application" }).click();
      await expect(
        page.getByRole("heading", { name: "Thank you" }),
      ).toBeVisible({ timeout: 20_000 });
      await expect(page.getByText(APPLY_SUCCESS)).toBeVisible();

      const { data: row, error } = await admin
        .from("applications")
        .select("id, linkedin, website")
        .eq("email", email)
        .maybeSingle();
      if (error) throw error;
      expect(row).toBeTruthy();
      expect(row?.linkedin).toBeNull();
      expect(row?.website).toBeNull();
    } finally {
      if (email) {
        await admin.from("applications").delete().eq("email", email);
      }
      if (userId) await admin.auth.admin.deleteUser(userId);
      await admin
        .from("site_settings")
        .update({
          open_applications: previousOpen,
          newsletter_signup_enabled: previousNewsletter,
        })
        .eq("id", 1);
    }
  });

  test("intake URLs redirect to the live path", async ({ page }) => {
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
      await setApplicationsOpenViaSettings(page, false);
      await page.context().clearCookies();
      await page.goto("/en/apply");
      await expect(page).toHaveURL(/\/en\/register-interest/, {
        timeout: 20_000,
      });

      await setApplicationsOpenViaSettings(page, true);
      await page.context().clearCookies();
      await page.goto("/en/register-interest");
      await expect(page).toHaveURL(/\/en\/apply/, { timeout: 20_000 });
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
      await setApplicationsOpenViaSettings(page, false);
      await page.goto("/en");
      await expect(
        page
          .locator("header")
          .locator('a[href="/en/register-interest"]')
          .first(),
      ).toBeVisible({ timeout: 20_000 });

      await setApplicationsOpenViaSettings(page, true);
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
