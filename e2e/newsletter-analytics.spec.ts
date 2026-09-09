import { expect, test } from "@playwright/test";

import {
  e2eAdminClient,
  e2eSuffix,
  expectViewerRedirectedFrom,
  hasE2ECredentials,
  loginAsAdmin,
} from "./helpers";

test.describe("newsletter signup e2e", () => {
  test("Insights newsletter signup is hidden in phase 1", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/en/insights");
    await expect(page.locator("#newsletter-email")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Register for updates" }),
    ).toHaveCount(0);
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
