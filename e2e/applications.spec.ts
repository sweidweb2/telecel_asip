import { expect, test } from "@playwright/test";

import {
  adminListRow,
  e2eAdminClient,
  e2eAnonClient,
  e2eSuffix,
  e2eViewerEmail,
  e2eViewerPassword,
  hasE2ECredentials,
  loginAsEditor,
} from "./helpers";

/**
 * Service-role inserts still hit `applications_require_open`.
 * Flip the flag for the insert only; restore afterward.
 */
async function insertApplicationWhileOpen(
  values: Record<string, unknown>,
): Promise<{ id: string }> {
  const admin = e2eAdminClient();
  const { data: before } = await admin
    .from("site_settings")
    .select("open_applications")
    .eq("id", 1)
    .maybeSingle();
  const previousOpen = Boolean(before?.open_applications);

  if (!previousOpen) {
    const { error: openError } = await admin
      .from("site_settings")
      .update({ open_applications: true })
      .eq("id", 1);
    if (openError) throw openError;
  }

  try {
    const { data: inserted, error: insertError } = await admin
      .from("applications")
      .insert(values)
      .select("id")
      .single();
    if (insertError) throw insertError;
    return inserted;
  } finally {
    if (!previousOpen) {
      await admin
        .from("site_settings")
        .update({ open_applications: false })
        .eq("id", 1);
    }
  }
}

test.describe("applications admin", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Applications E2E requires real Supabase credentials.",
    );
  });

  test(
    "admin can search, edit, and delete an application",
    { tag: "@writes" },
    async ({ page }) => {
    test.setTimeout(90_000);
    const suffix = e2eSuffix();
    const email = `apps.admin.${suffix}@example.com`;
    const company = `Apps Co ${suffix}`;
    const admin = e2eAdminClient();

    const inserted = await insertApplicationWhileOpen({
      full_name: "Apps Admin E2E",
      founder_role: "Founder",
      email,
      phone: "+233201234567",
      country: "Ghana",
      linkedin: "https://linkedin.com/in/appsadmin",
      company_name: company,
      website: "https://appsadmin.example.com",
      company_country: "Ghana",
      sector: "Fintech",
      problem_product:
        "SMEs lack credit. We underwrite inventory loans for African merchants in days.",
      traction: "100 merchants live and $30k GMV last quarter.",
      programme_fit: "Need intros to banks and regional operators.",
      consent: true,
      comms_opt_in: false,
    });

    try {
      await loginAsEditor(page, "/dashboard/applications");
      await page.getByLabel("Search applications").fill(email);
      await expect(page).toHaveURL(new RegExp(`search=apps\\.admin\\.${suffix}`), {
        timeout: 15_000,
      });
      const row = adminListRow(
        page,
        "View application from Apps Admin E2E",
      );
      await expect(row).toBeVisible({ timeout: 15_000 });

      await page.getByRole("button", { name: "Edit Apps Admin E2E" }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Startup").fill(`${company} edited`);
      await dialog.getByRole("button", { name: "Save changes" }).click();
      await expect(
        page
          .locator("[data-sonner-toast]")
          .filter({ hasText: "Application updated successfully." }),
      ).toBeVisible({ timeout: 20_000 });

      await page
        .getByRole("button", { name: /Delete Apps Admin E2E/ })
        .click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: /Delete/i })
        .click();
      await expect(
        page
          .locator("[data-sonner-toast]")
          .filter({ hasText: "Application deleted successfully." }),
      ).toBeVisible({ timeout: 20_000 });
      await expect(
        adminListRow(page, "View application from Apps Admin E2E"),
      ).toHaveCount(0);
    } finally {
      if (inserted?.id) {
        await admin.from("applications").delete().eq("id", inserted.id);
      }
      await admin.from("applications").delete().eq("email", email);
    }
    },
  );

  test(
    "opening an unread application marks reviewed then archive works",
    { tag: "@writes" },
    async ({ page }) => {
      test.setTimeout(90_000);
      const suffix = e2eSuffix();
      const email = `apps.triage.${suffix}@example.com`;
      const admin = e2eAdminClient();

      const inserted = await insertApplicationWhileOpen({
        full_name: "Apps Triage E2E",
        founder_role: "Founder",
        email,
        phone: "+233201234567",
        country: "Ghana",
        company_name: `Triage Co ${suffix}`,
        company_country: "Ghana",
        sector: "Fintech",
        problem_product:
          "SMEs lack credit. We underwrite inventory loans for African merchants in days.",
        traction: "100 merchants live and $30k GMV last quarter.",
        programme_fit: "Need intros to banks and regional operators.",
        consent: true,
        comms_opt_in: false,
        inbox_status: "unread",
      });

      try {
        await loginAsEditor(page, "/dashboard/applications");
        await page.getByLabel("Search applications").fill(email);
        await expect(
          adminListRow(page, "View application from Apps Triage E2E"),
        ).toBeVisible({ timeout: 15_000 });

        await adminListRow(
          page,
          "View application from Apps Triage E2E",
        ).click();
        await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10_000 });

        await expect
          .poll(
            async () => {
              const { data } = await admin
                .from("applications")
                .select("inbox_status")
                .eq("id", inserted.id)
                .maybeSingle();
              return data?.inbox_status ?? null;
            },
            { timeout: 20_000 },
          )
          .toBe("reviewed");

        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).toHaveCount(0);

        await page.getByRole("button", { name: "Archive" }).click();
        await expect(
          page.locator("[data-sonner-toast]").filter({ hasText: "Archived." }),
        ).toBeVisible({ timeout: 20_000 });

        const { data: after } = await admin
          .from("applications")
          .select("inbox_status")
          .eq("id", inserted.id)
          .maybeSingle();
        expect(after?.inbox_status).toBe("archived");
      } finally {
        if (inserted?.id) {
          await admin.from("applications").delete().eq("id", inserted.id);
        }
        await admin.from("applications").delete().eq("email", email);
      }
    },
  );

  test("viewer RLS blocks applications table reads", async () => {
    test.setTimeout(30_000);
    const anon = e2eAnonClient();
    const { error: signInError } = await anon.auth.signInWithPassword({
      email: e2eViewerEmail,
      password: e2eViewerPassword,
    });
    if (signInError) throw signInError;

    const { data, error: listError } = await anon
      .from("applications")
      .select("id")
      .limit(5);
    expect(listError).toBeNull();
    expect(data ?? []).toEqual([]);
  });
});
