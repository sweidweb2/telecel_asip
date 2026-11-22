import { expect, test, type Page } from "@playwright/test";
import { nanoid } from "nanoid";
import { TURNSTILE_WIDGET_ENABLED } from "../lib/turnstile-widget";

import {
  adminListRow,
  e2eAdminClient,
  hasE2ECredentials,
  loginAsEditor,
} from "./helpers";

const RATE_LIMIT_TOAST =
  "Too many submissions. Please wait and try again later.";
const BODY =
  "I would like to learn more about partnering with ASIP for the next cohort.";

async function cleanupMessagesByEmail(email: string) {
  const { error } = await e2eAdminClient()
    .from("contact_messages")
    .delete()
    .eq("email", email.toLowerCase());
  if (error) throw error;
}

async function countMessagesByEmail(email: string): Promise<number> {
  const { count, error } = await e2eAdminClient()
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("email", email.toLowerCase());
  if (error) throw error;
  return count ?? 0;
}

async function fillContactForm(
  page: Page,
  values: {
    name: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
  },
) {
  await page.locator("#contact-fullName").fill(values.name);
  await page.locator("#contact-phone").fill(values.phone);
  await page.locator("#contact-email").fill(values.email);
  await page.locator("#contact-subject").fill(values.subject);
  await page.locator("#contact-message").fill(values.message);
}

/** Wait until Turnstile issues a token (submit becomes enabled). */
async function waitForTurnstileReady(page: Page) {
  const submit = page.getByRole("button", { name: "Send message" });
  if (!TURNSTILE_WIDGET_ENABLED) {
    await expect(submit).toBeEnabled({ timeout: 15_000 });
    return;
  }
  await expect(page.getByTestId("contact-turnstile")).toBeVisible({
    timeout: 30_000,
  });
  try {
    await expect(submit).toBeEnabled({ timeout: 60_000 });
  } catch {
    test.skip(
      true,
      "Turnstile did not issue a token - check NEXT_PUBLIC_TURNSTILE_SITE_KEY and hostname allowlist for localhost.",
    );
  }
}

/** Contact success UI is a dialog (not a Sonner toast). */
async function expectContactSuccessDialog(page: Page) {
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Thank you" }),
  ).toBeVisible({ timeout: 20_000 });
  await expect(
    dialog.getByText(/Your message has been sent/i),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).first().click();
  await expect(dialog).toHaveCount(0);
}

test.describe("contact messages", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Contact E2E requires real Supabase credentials.",
    );
  });

  test(
    "public submit succeeds and same email+subject follow-up is allowed",
    { tag: "@writes" },
    async ({ page }) => {
      test.setTimeout(90_000);
      const suffix = nanoid(8).toLowerCase();
      const email = `contact.e2e.${suffix}@example.com`;
      const subject = `Partnership inquiry ${suffix}`;

      try {
        await page.goto("/en/contact");
        await expect(
          page.getByRole("heading", { name: "Contact us" }),
        ).toBeVisible();

        await fillContactForm(page, {
          name: "Contact E2E User",
          phone: "+233201234567",
          email,
          subject,
          message: BODY,
        });
        await waitForTurnstileReady(page);
        await page.getByRole("button", { name: "Send message" }).click();
        await expectContactSuccessDialog(page);
        expect(await countMessagesByEmail(email)).toBe(1);

        await fillContactForm(page, {
          name: "Contact E2E User",
          phone: "+233201234567",
          email,
          subject,
          message: `${BODY} Follow-up details included.`,
        });
        await waitForTurnstileReady(page);
        await page.getByRole("button", { name: "Send message" }).click();
        await expectContactSuccessDialog(page);
        expect(await countMessagesByEmail(email)).toBe(2);
      } finally {
        await cleanupMessagesByEmail(email);
      }
    },
  );

  test(
    "fourth submit for the same email shows rate-limit toast",
    { tag: "@writes" },
    async ({ page }) => {
    test.setTimeout(120_000);
    const suffix = nanoid(8).toLowerCase();
    const email = `contact.rl.${suffix}@example.com`;

    try {
      await page.goto("/en/contact");

      for (let i = 0; i < 3; i += 1) {
        await fillContactForm(page, {
          name: "Rate Limit E2E",
          phone: "+233201234567",
          email,
          subject: `Rate limit subject ${suffix}-${i}`,
          message: `${BODY} Attempt ${i + 1}.`,
        });
        await waitForTurnstileReady(page);
        await page.getByRole("button", { name: "Send message" }).click();
        await expectContactSuccessDialog(page);
      }

      expect(await countMessagesByEmail(email)).toBe(3);

      await fillContactForm(page, {
        name: "Rate Limit E2E",
        phone: "+233201234567",
        email,
        subject: `Rate limit subject ${suffix}-blocked`,
        message: `${BODY} Attempt 4 should be blocked.`,
      });
      await waitForTurnstileReady(page);
      await page.getByRole("button", { name: "Send message" }).click();
      await expect(
        page
          .locator("[data-sonner-toast][data-type='error']")
          .filter({ hasText: RATE_LIMIT_TOAST }),
      ).toBeVisible({ timeout: 20_000 });
      expect(await countMessagesByEmail(email)).toBe(3);
    } finally {
      await cleanupMessagesByEmail(email);
    }
    },
  );

  test(
    "admin can list, search by email, edit, and delete",
    { tag: "@writes" },
    async ({ page }) => {
    test.setTimeout(90_000);
    const suffix = nanoid(8).toLowerCase();
    const email = `contact.admin.${suffix}@example.com`;
    const subject = `Admin manage ${suffix}`;
    const admin = e2eAdminClient();

    const { data: inserted, error: insertError } = await admin
      .from("contact_messages")
      .insert({
        full_name: "Admin Manage E2E",
        email,
        phone: "+233201234567",
        subject,
        message: BODY,
      })
      .select("id")
      .single();
    if (insertError) throw insertError;

    try {
      await loginAsEditor(page, "/dashboard/contact-us");

      await expect(
        page.getByRole("heading", { name: "Contact us" }),
      ).toBeVisible();

      await page.getByLabel("Search contact messages").fill(email);
      await expect(
        page,
      ).toHaveURL(new RegExp(`search=contact\\.admin\\.${suffix}`), {
        timeout: 15_000,
      });

      const row = adminListRow(page, "View message from Admin Manage E2E");
      await expect(row).toBeVisible({ timeout: 15_000 });

      await page.getByRole("button", { name: `Edit ${subject}` }).click();
      const editDialog = page.getByRole("dialog");
      const updatedSubject = `${subject} edited`;
      await editDialog.getByLabel("Subject").fill(updatedSubject);
      await editDialog.getByRole("button", { name: "Save changes" }).click();
      await expect(
        page
          .locator("[data-sonner-toast]")
          .filter({ hasText: "Message updated successfully." }),
      ).toBeVisible({ timeout: 20_000 });
      await expect(
        page.getByRole("button", { name: `Edit ${updatedSubject}` }),
      ).toBeVisible();

      await page
        .getByRole("button", { name: `Delete ${updatedSubject}` })
        .click();
      const deleteDialog = page.getByRole("alertdialog");
      await expect(deleteDialog.getByText(/cannot be undone/i)).toBeVisible();
      await deleteDialog.getByRole("button", { name: "Delete" }).click();
      await expect(
        page
          .locator("[data-sonner-toast]")
          .filter({ hasText: "Message deleted successfully." }),
      ).toBeVisible({ timeout: 20_000 });
      await expect(
        adminListRow(page, "View message from Admin Manage E2E"),
      ).toHaveCount(0);
    } finally {
      if (inserted?.id) {
        await admin.from("contact_messages").delete().eq("id", inserted.id);
      }
      await cleanupMessagesByEmail(email);
    }
    },
  );
});
