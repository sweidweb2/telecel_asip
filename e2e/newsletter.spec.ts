import { expect, test } from "@playwright/test";

import {
  e2eAdminClient,
  e2eAnonClient,
  e2eSuffix,
  hasE2ECredentials,
  loginAsEditor,
  submitLoginForm,
} from "./helpers";

test.describe("newsletter inbox", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Newsletter E2E requires real Supabase credentials.",
    );
  });

  test("editor can open newsletter list and search a subscriber", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const suffix = e2eSuffix();
    const email = `news.e2e.${suffix}@example.com`;
    const admin = e2eAdminClient();

    const { data: inserted, error: insertError } = await admin
      .from("newsletter_subscribers")
      .insert({
        email,
        consent: true,
        source_page: `/en/insights?e2e=${suffix}`,
      })
      .select("id")
      .single();
    if (insertError) throw insertError;

    try {
      await loginAsEditor(page, "/dashboard/newsletter");
      await expect(page.getByRole("main", { name: "Newsletter" })).toBeVisible({
        timeout: 20_000,
      });
      await expect(
        page.getByText("No subscribers yet").or(page.getByText(email)),
      ).toBeVisible();

      await page.getByLabel("Search newsletter subscribers").fill(email);
      await expect(page).toHaveURL(
        new RegExp(`search=news\\.e2e\\.${suffix}`),
        { timeout: 15_000 },
      );
      await expect(page.getByText(email)).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText("Yes").first()).toBeVisible();
    } finally {
      if (inserted?.id) {
        await admin
          .from("newsletter_subscribers")
          .delete()
          .eq("id", inserted.id);
      }
      await admin.from("newsletter_subscribers").delete().eq("email", email);
    }
  });

  test("viewer cannot open newsletter and RLS blocks reads", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const suffix = e2eSuffix();
    const email = `news.viewer.${suffix}@example.com`;
    const password = "Testpass1";
    const admin = e2eAdminClient();
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "News Viewer" },
      app_metadata: { app_role: "viewer" },
    });
    if (error) throw error;

    try {
      await page.goto("/en/login?next=%2Fdashboard%2Fnewsletter");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await submitLoginForm(page);
      await expect(page).toHaveURL(/\/en$/, { timeout: 20_000 });

      const anon = e2eAnonClient();
      const { error: signInError } = await anon.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      const { data, error: listError } = await anon
        .from("newsletter_subscribers")
        .select("id")
        .limit(5);
      expect(listError).toBeNull();
      expect(data ?? []).toEqual([]);
    } finally {
      if (created.user?.id) {
        await admin.auth.admin.deleteUser(created.user.id);
      }
    }
  });

});
