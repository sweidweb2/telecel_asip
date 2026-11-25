import { test } from "@playwright/test";

import {
  expectViewerRedirectedFrom,
  hasE2ECredentials,
} from "./helpers";

const STAFF_PATHS = [
  "/dashboard",
  "/dashboard/settings",
  "/dashboard/analytics",
  "/dashboard/applications",
  "/dashboard/registrations",
  "/dashboard/cohorts",
  "/dashboard/events",
  "/dashboard/blogs",
  "/dashboard/newsletter",
  "/dashboard/impact-metrics",
  "/dashboard/partners",
  "/admin",
  "/admin/backup",
  "/admin/settings",
  "/admin/users",
  "/admin/catalog",
] as const;

test.describe("viewer dashboard redirect matrix", () => {
  test.beforeEach(() => {
    test.skip(
      !hasE2ECredentials(),
      "Viewer redirect E2E requires real Supabase credentials.",
    );
  });

  for (const path of STAFF_PATHS) {
    test(`viewer is redirected from ${path}`, async ({ page }) => {
      test.setTimeout(45_000);
      await expectViewerRedirectedFrom(page, path);
    });
  }
});
