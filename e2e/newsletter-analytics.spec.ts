import { expect, test } from "@playwright/test";

import {
  e2eAdminClient,
  e2eSuffix,
  expectViewerRedirectedFrom,
  hasE2ECredentials,
  loginAsAdmin,
  waitForTurnstileReady,
} from "./helpers";

test.describe("newsletter signup e2e", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Newsletter E2E requires real Supabase credentials.",
    );
  });

  test("visitor can subscribe when newsletter is enabled", async ({ page }) => {
    test.setTimeout(120_000);
    const suffix = e2eSuffix();
    const email = `newsletter.${suffix}@example.com`;
    const admin = e2eAdminClient();

    const { data: before } = await admin
      .from("site_settings")
      .select("newsletter_signup_enabled")
      .eq("id", 1)
      .maybeSingle();
    const previous = Boolean(before?.newsletter_signup_enabled);

    try {
      // Flip via admin UI so Next cache tags revalidate (service-role DB writes alone do not).
      await loginAsAdmin(page, "/dashboard/settings");
      const newsletterSwitch = page.getByRole("switch").nth(1);
      if ((await newsletterSwitch.getAttribute("aria-checked")) !== "true") {
        await newsletterSwitch.click();
        await page.getByRole("button", { name: "Save changes" }).click();
        await expect(
          page
            .locator("[data-sonner-toast]")
            .filter({ hasText: "Settings saved" }),
        ).toBeVisible({ timeout: 20_000 });
      }

      await page.goto("/en/insights");
      const emailField = page.locator("#newsletter-email");
      await expect(emailField).toBeEnabled({ timeout: 20_000 });
      await emailField.fill(email);
      await page.locator("label").filter({ hasText: /agree to ASIP storing/i }).click();
      await waitForTurnstileReady(page, {
        testId: "newsletter-turnstile",
        submitName: "Register for updates",
      });
      await page.getByRole("button", { name: "Register for updates" }).click();
      await expect(
        page.locator("[data-sonner-toast]").filter({
          hasText: /thank|subscribed|registered|success|update/i,
        }),
      ).toBeVisible({ timeout: 20_000 });

      const { data: row } = await admin
        .from("newsletter_subscribers")
        .select("id")
        .ilike("email", email)
        .maybeSingle();
      expect(row?.id).toBeTruthy();
    } finally {
      await admin.from("newsletter_subscribers").delete().ilike("email", email);
      await admin
        .from("site_settings")
        .update({ newsletter_signup_enabled: previous })
        .eq("id", 1);
    }
  });
});

test.describe("admin analytics and performance authz", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Analytics authz E2E requires real Supabase credentials.",
    );
  });

  test("admin can open analytics and performance", async ({ page }) => {
    test.setTimeout(60_000);
    await loginAsAdmin(page, "/dashboard/analytics");
    await expect(
      page.getByRole("heading", { name: /analytics/i }),
    ).toBeVisible();
    await page.goto("/dashboard/performance");
    await expect(
      page.getByRole("heading", { name: /performance/i }),
    ).toBeVisible();
  });

  test("viewer is redirected away from analytics", async ({ page }) => {
    test.setTimeout(60_000);
    await expectViewerRedirectedFrom(page, "/dashboard/analytics");
  });

  test("viewer is redirected away from performance", async ({ page }) => {
    test.setTimeout(60_000);
    await expectViewerRedirectedFrom(page, "/dashboard/performance");
  });
});

test.describe("public detail smoke with fixtures", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Detail smoke E2E requires real Supabase credentials.",
    );
  });

  test("published insight and active founder detail render", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const suffix = e2eSuffix();
    const admin = e2eAdminClient();
    const blogSlug = `e2e-insight-${suffix}`;
    const startupSlug = `e2e-founder-${suffix}`;

    const { data: blog, error: blogError } = await admin
      .from("blogs")
      .insert({
        title: `E2E Insight ${suffix}`,
        slug: blogSlug,
        summary: "Fixture insight for public detail smoke.",
        body_html: "<p>Fixture body for public detail smoke.</p>",
        categories: ["Founder Stories"],
        author_name: "ASIP Editorial",
        status: "published",
        is_featured: false,
        published_at: new Date().toISOString(),
        reading_time_minutes: 1,
      })
      .select("id")
      .single();
    if (blogError) throw blogError;

    const { data: startup, error: startupError } = await admin
      .from("startups")
      .insert({
        name: `E2E Founder ${suffix}`,
        slug: startupSlug,
        description: "Fixture founder for public detail smoke.",
        status: "active",
      })
      .select("id")
      .single();
    if (startupError) {
      await admin.from("blogs").delete().eq("id", blog.id);
      throw startupError;
    }

    try {
      await page.goto(`/en/insights/${blogSlug}`);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        `E2E Insight ${suffix}`,
      );
      await page.goto(`/en/founders/${startupSlug}`);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        `E2E Founder ${suffix}`,
      );
    } finally {
      await admin.from("blogs").delete().eq("id", blog.id);
      await admin.from("startups").delete().eq("id", startup.id);
    }
  });
});
