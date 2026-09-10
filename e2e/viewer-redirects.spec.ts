import { test } from "@playwright/test";

import {
  expectViewerRedirectedFrom,
  hasE2ECredentials,
} from "./helpers";

test.describe("viewer dashboard redirect matrix", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Viewer redirect E2E requires real Supabase credentials.",
    );
  });

  for (const path of [
    "/dashboard/settings",
    "/dashboard/analytics",
    "/dashboard/cohorts",
    "/dashboard/events",
    "/admin/performance",
    "/admin/backup",
    "/admin/users",
  ] as const) {
    test(`viewer is redirected from ${path}`, async ({ page }) => {
      test.setTimeout(60_000);
      await expectViewerRedirectedFrom(page, path);
    });
  }
});
