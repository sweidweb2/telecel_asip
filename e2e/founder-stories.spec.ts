import { expect, test } from "@playwright/test";

import { e2eAdminClient, e2eSuffix, hasE2ECredentials, loginAsEditor, clickSaveChanges } from "./helpers";

test.describe("founder stories cms", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Founder stories E2E requires real Supabase credentials.",
    );
  });

  test("admin can create, edit, and delete a founder story", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const suffix = e2eSuffix();
    const startupName = `E2E Story Startup ${suffix}`;
    const admin = e2eAdminClient();
    let startupId: string | null = null;

    const { data: startup, error: startupError } = await admin
      .from("startups")
      .insert({
        name: startupName,
        slug: `e2e-story-${suffix}`,
        description: "Temporary startup for founder story E2E.",
        status: "draft",
      })
      .select("id")
      .single();
    if (startupError) throw startupError;
    startupId = startup.id;

    try {
      await loginAsEditor(page, "/dashboard/founder-stories");
      await page
        .locator('a[href="/dashboard/founder-stories/new"]')
        .first()
        .click();
      await expect(page).toHaveURL(/\/dashboard\/founder-stories\/new/, {
        timeout: 20_000,
      });

      await page.getByRole("combobox", { name: "Startup" }).click();
      await page.getByLabel("Search startups…").fill(startupName);
      await expect(
        page.getByRole("option", { name: startupName }),
      ).toBeVisible({ timeout: 20_000 });
      await page.getByRole("option", { name: startupName }).click();

      await page.getByRole("tab", { name: /^Story$/i }).click();
      await page.getByLabel("The problem").fill("Founders lacked local distribution.");
      await page
        .getByLabel("What they built")
        .fill("A marketplace connecting merchants to buyers.");
      await page
        .getByLabel("The ASIP connection")
        .fill("ASIP introduced mentors and early customers.");
      await page
        .getByLabel("Where they are now")
        .fill("Expanding into two new markets this year.");
      await page.getByRole("button", { name: "Create story" }).click();

      await expect(page).toHaveURL(/\/dashboard\/founder-stories\/[0-9a-f-]+/, {
        timeout: 20_000,
      });
      await page.getByRole("tab", { name: /^Story$/i }).click();
      await page
        .getByLabel("The problem")
        .fill("Founders lacked reliable distribution across regions.");
      await clickSaveChanges(page);
      await expect(
        page.locator("[data-sonner-toast]").filter({
          hasText: /Founder story updated successfully/i,
        }),
      ).toBeVisible({ timeout: 20_000 });

      await page.getByRole("button", { name: "Delete story" }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Delete story" })
        .click();
      await expect(page).toHaveURL(/\/dashboard\/founder-stories$/, {
        timeout: 20_000,
      });
    } finally {
      if (startupId) {
        await admin.from("founder_stories").delete().eq("startup_id", startupId);
        await admin.from("startups").delete().eq("id", startupId);
      }
    }
  });

  test("published founder story is visible on the public founders page", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const suffix = e2eSuffix();
    const startupName = `E2E Public Story ${suffix}`;
    const admin = e2eAdminClient();

    const { data: startup, error: startupError } = await admin
      .from("startups")
      .insert({
        name: startupName,
        slug: `e2e-public-story-${suffix}`,
        description: "Public founder story fixture.",
        status: "active",
      })
      .select("id")
      .single();
    if (startupError) throw startupError;

    const { error: storyError } = await admin.from("founder_stories").insert({
      startup_id: startup.id,
      the_problem: "Distribution was fragmented across markets.",
      what_they_built: "A logistics platform for SMB retailers.",
      the_asip_connection: "ASIP opened mentor and customer intros.",
      where_they_are_now: "Serving three countries with paid pilots.",
      publish_status: "published",
    });
    if (storyError) {
      await admin.from("startups").delete().eq("id", startup.id);
      throw storyError;
    }

    try {
      await page.goto(`/en/founders/e2e-public-story-${suffix}`);
      await expect(
        page.getByText("Distribution was fragmented across markets."),
      ).toBeVisible({ timeout: 20_000 });
    } finally {
      await admin.from("founder_stories").delete().eq("startup_id", startup.id);
      await admin.from("startups").delete().eq("id", startup.id);
    }
  });
});
