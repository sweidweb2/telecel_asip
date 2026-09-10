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

  it("uses action titles for nested create/edit routes", () => {
    expect(getDashboardPageTitle(ROUTES.blogsNew)).toBe("New blog");
    expect(getDashboardPageTitle(`${ROUTES.blogs}/some-id`)).toBe("Edit blog");
    expect(getDashboardPageTitle(ROUTES.partnersNew)).toBe("New partner");
    expect(getDashboardPageTitle(`${ROUTES.partners}/some-id`)).toBe(
      "Edit partner",
    );
    expect(getDashboardPageTitle(ROUTES.portfolioNew)).toBe("New startup");
    expect(getDashboardPageTitle(`${ROUTES.portfolio}/abc`)).toBe(
      "Edit startup",
    );
    expect(getDashboardPageTitle(ROUTES.cohortsNew)).toBe("New cohort");
    expect(getDashboardPageTitle(`${ROUTES.cohorts}/abc`)).toBe("Edit cohort");
    expect(getDashboardPageTitle(ROUTES.eventsNew)).toBe("New event");
    expect(getDashboardPageTitle(`${ROUTES.events}/abc`)).toBe("Edit event");
    expect(getDashboardPageTitle(ROUTES.founderStoriesNew)).toBe(
      "New founder story",
    );
    expect(getDashboardPageTitle(`${ROUTES.founderStories}/abc`)).toBe(
      "Edit founder story",
    );
    expect(getDashboardPageTitle(ROUTES.evidenceNew)).toBe(
      "New evidence record",
    );
    expect(getDashboardPageTitle(`${ROUTES.evidence}/abc`)).toBe(
      "Edit evidence record",
    );
    expect(getDashboardPageTitle(ROUTES.impactMetricsNew)).toBe(
      "New impact metric",
    );
    expect(getDashboardPageTitle(`${ROUTES.impactMetrics}/abc`)).toBe(
      "Edit impact metric",
    );
  });

  it("keeps list routes as nav titles", () => {
    expect(getDashboardPageTitle(ROUTES.blogs)).toBe("Blogs");
    expect(getDashboardPageTitle(ROUTES.partners)).toBe("Partners");
    expect(getDashboardPageTitle(ROUTES.portfolio)).toBe("Startups");
  });

  it("titles Analytics from System nav", () => {
    expect(getDashboardPageTitle(ROUTES.analytics)).toBe("Analytics");
  });
});
