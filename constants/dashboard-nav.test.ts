import { describe, expect, it } from "vitest";

import {
  getDashboardPageTitle,
  isDashboardNavActive,
} from "@/constants/dashboard-nav";
import { ROUTES } from "@/constants/routes";

describe("isDashboardNavActive", () => {
  it("matches dashboard only exactly", () => {
    expect(isDashboardNavActive(ROUTES.dashboard, ROUTES.dashboard)).toBe(
      true,
    );
    expect(isDashboardNavActive(ROUTES.blogs, ROUTES.dashboard)).toBe(false);
    expect(isDashboardNavActive(`${ROUTES.blogs}/new`, ROUTES.dashboard)).toBe(
      false,
    );
  });

  it("matches nested resource paths", () => {
    expect(isDashboardNavActive(ROUTES.blogs, ROUTES.blogs)).toBe(true);
    expect(isDashboardNavActive(`${ROUTES.blogs}/new`, ROUTES.blogs)).toBe(
      true,
    );
    expect(
      isDashboardNavActive(`${ROUTES.partners}/abc`, ROUTES.partners),
    ).toBe(true);
    expect(isDashboardNavActive(ROUTES.portfolio, ROUTES.blogs)).toBe(false);
  });
});

describe("getDashboardPageTitle", () => {
  it("returns nav titles for list routes", () => {
    expect(getDashboardPageTitle(ROUTES.dashboard)).toBe("Dashboard");
    expect(getDashboardPageTitle(ROUTES.settings)).toBe("Settings");
    expect(getDashboardPageTitle(ROUTES.blogs)).toBe("Blogs");
  });

  it("resolves nested routes to the parent resource", () => {
    expect(getDashboardPageTitle(`${ROUTES.blogs}/new`)).toBe("Blogs");
    expect(getDashboardPageTitle(`${ROUTES.partners}/some-id`)).toBe(
      "Partners",
    );
    expect(getDashboardPageTitle(`${ROUTES.portfolio}/new`)).toBe("Portfolio");
  });

  it("titles coming-soon routes that are not in the sidebar", () => {
    expect(getDashboardPageTitle(ROUTES.analytics)).toBe("Analytics");
    expect(getDashboardPageTitle(ROUTES.backup)).toBe("Backup");
  });
});
