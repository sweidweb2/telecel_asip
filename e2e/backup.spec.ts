import { expect, test } from "@playwright/test";

import { e2eAdminClient, e2eSuffix, hasE2ECredentials, loginAsAdmin, loginAsEditor, submitLoginForm } from "./helpers";

test.describe.configure({ mode: "serial" });

test("backup cron rejects missing secret", async ({ request }) => {
  const response = await request.post("/api/cron/backup");
  expect(response.status()).toBe(401);
});

test.describe("backup export API", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Backup E2E requires real Supabase credentials.",
    );
  });

  test("editor settings points backup schedule to admin backup page", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await loginAsEditor(page, "/dashboard/settings");
    await expect(
      page.getByText(
        /automated backup schedule is managed by administrators on the backup page/i,
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: /backup schedule/i }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /run backup now/i }),
    ).toHaveCount(0);
  });

  test("admin backup page shows create, run now, and history", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await loginAsAdmin(page, "/admin/backup");
    await expect(
      page.getByRole("heading", { name: "Create backup" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Backup history" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /full db backup/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /storage backup/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /selected tables/i }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /^create backup$/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /run backup now/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Quick CSV" }),
    ).toHaveCount(0);
  });

  test("editor applications page offers CSV download", async ({ page }) => {
    test.setTimeout(60_000);
    await loginAsEditor(page, "/dashboard/applications");
    await expect(
      page.getByRole("link", { name: /download csv/i }),
    ).toBeVisible();
  });

  test("editor can export an allowed table", async ({ page, request }) => {
    test.setTimeout(60_000);
    await loginAsEditor(page, "/dashboard/applications");
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const response = await request.get("/api/admin/export/applications", {
      headers: { cookie: cookieHeader },
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/text\/csv/);
    const body = await response.text();
    expect(body).toContain("email");
  });

  test("unknown export table returns 404 for editors", async ({
    page,
    request,
  }) => {
    test.setTimeout(60_000);
    await loginAsEditor(page, "/dashboard/applications");
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const response = await request.get("/api/admin/export/not_a_table", {
      headers: { cookie: cookieHeader },
    });
    expect(response.status()).toBe(404);
  });

  test("viewer receives 403", async ({ browser }) => {
    test.setTimeout(60_000);
    const suffix = e2eSuffix();
    const email = `backup.viewer.${suffix}@example.com`;
    const password = "Testpass1";
    const admin = e2eAdminClient();
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Backup Viewer" },
      app_metadata: { app_role: "viewer" },
    });
    if (error) throw error;

    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto("/en/login");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await submitLoginForm(page);
      await expect(page).toHaveURL(/\/en$/, { timeout: 20_000 });

      const cookies = await context.cookies();
      const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
      const response = await context.request.get(
        "/api/admin/export/applications",
        { headers: { cookie: cookieHeader } },
      );
      expect(response.status()).toBe(403);
    } finally {
      await context.close();
      if (created.user?.id) {
        await admin.auth.admin.deleteUser(created.user.id);
      }
    }
  });
});
