import { expect, test, type Page } from "@playwright/test";

import {
  e2eAdminClient,
  e2eSuffix,
  hasE2ECredentials,
  setApplicationsOpenViaSettings,
  submitLoginForm,
} from "./helpers";

test.describe.configure({ mode: "serial" });

async function createInvestorAndSignIn(
  page: Page,
  nextPath: string,
): Promise<{ email: string; userId: string }> {
  const suffix = e2eSuffix();
  const email = `inv.intake.${suffix}@example.com`;
  const password = "Testpass1";
  const admin = e2eAdminClient();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Investor Intake E2E" },
    app_metadata: { app_role: "viewer" },
  });
  if (error) throw error;
  if (!created.user?.id) throw new Error("Investor create returned no user id");

  const { error: profileError } = await admin
    .from("profiles")
    .update({ type: "investor" })
    .eq("id", created.user.id);
  if (profileError) throw profileError;

  await page.context().clearCookies();
  await page.goto(`/en/login?next=${encodeURIComponent(nextPath)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await submitLoginForm(page);
  await expect(page).toHaveURL(new RegExp(nextPath.replace(/\//g, "\\/")), {
    timeout: 20_000,
  });

  return { email, userId: created.user.id };
}

test.describe("public investor intake submit", { tag: "@writes" }, () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Investor intake E2E requires real Supabase credentials.",
    );
  });

  test("investor can submit interest when applications are closed", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const admin = e2eAdminClient();
    const organization = `Inv Interest Org ${e2eSuffix()}`;
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
      const investor = await createInvestorAndSignIn(
        page,
        "/en/register-interest",
      );
      userId = investor.userId;
      email = investor.email;

      await expect(
        page.getByRole("heading", { name: "Connect with ASIP founders." }),
      ).toBeVisible();
      await page.locator("#investor-fullName").fill("Investor Interest E2E");
      await page.locator("#investor-org").fill(organization);
      await page
        .locator("#investor-focus")
        .fill("Looking for FinTech seed founders across West Africa markets.");
      await page
        .getByRole("checkbox", {
          name: /I agree that ASIP may store and use this information/i,
        })
        .click();      await page.getByRole("button", { name: "Register interest" }).click();
      await expect(
        page.getByRole("heading", { name: "Interest registered" }),
      ).toBeVisible({ timeout: 20_000 });

      const { data: rows, error } = await admin
        .from("investor_interests")
        .select("id, organization, email")
        .eq("email", email.toLowerCase());
      if (error) throw error;
      expect(rows?.length).toBeGreaterThan(0);
      expect(rows?.[0]?.organization).toBe(organization);
    } finally {
      if (email) {
        await admin.from("investor_interests").delete().eq("email", email);
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

  test("investor can submit engagement when applications are open", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const admin = e2eAdminClient();
    const organization = `Inv Engage Org ${e2eSuffix()}`;
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
      const investor = await createInvestorAndSignIn(page, "/en/apply");
      userId = investor.userId;
      email = investor.email;

      await expect(
        page.getByRole("heading", { name: "Engage with ASIP founders." }),
      ).toBeVisible();
      await page.locator("#investor-fullName").fill("Investor Engagement E2E");
      await page.locator("#investor-org").fill(organization);
      await page.getByRole("checkbox", { name: "Seed" }).click();
      await page.getByRole("checkbox", { name: "FinTech" }).click();
      await page.getByRole("checkbox", { name: "West Africa" }).click();
      await page.locator("#investor-thesis").fill(
        "We back early-stage African FinTech founders building payments and credit infrastructure for SMEs.",
      );
      await page
        .getByRole("checkbox", {
          name: /I agree that ASIP may store and use this information/i,
        })
        .click();      await page
        .getByRole("button", { name: "Submit engagement request" })
        .click();
      await expect(
        page.getByRole("heading", { name: "Request submitted" }),
      ).toBeVisible({ timeout: 20_000 });

      const { data: rows, error } = await admin
        .from("investor_engagements")
        .select("id, organization, email")
        .eq("email", email.toLowerCase());
      if (error) throw error;
      expect(rows?.length).toBeGreaterThan(0);
      expect(rows?.[0]?.organization).toBe(organization);
    } finally {
      if (email) {
        await admin.from("investor_engagements").delete().eq("email", email);
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
});
