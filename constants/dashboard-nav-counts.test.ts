import { describe, expect, it } from "vitest";

import {
  DASHBOARD_NAV_COUNT_TABLES,
  isDashboardNavCountHref,
  mapDashboardNavCounts,
} from "@/constants/dashboard-nav-counts";
import { ROUTES } from "@/constants/routes";

describe("mapDashboardNavCounts", () => {
  it("maps table keys onto sidebar hrefs", () => {
    const counts = mapDashboardNavCounts({
      blogs: 4,
      startups: "12",
      profiles: 2,
    });

    expect(counts[ROUTES.blogs]).toBe(4);
    expect(counts[ROUTES.portfolio]).toBe(12);
    expect(counts[ROUTES.users]).toBe(2);
    expect(counts[ROUTES.partners]).toBeUndefined();
  });

  it("omits invalid payloads and non-numeric values", () => {
    expect(mapDashboardNavCounts(null)).toEqual({});
    expect(mapDashboardNavCounts("nope")).toEqual({});
    expect(mapDashboardNavCounts({ blogs: "x" })).toEqual({});
  });

  it("covers every sidebar badge href", () => {
    expect(DASHBOARD_NAV_COUNT_TABLES).toHaveLength(15);
    expect(isDashboardNavCountHref(ROUTES.registrations)).toBe(true);
    expect(isDashboardNavCountHref(ROUTES.dashboard)).toBe(false);
    expect(isDashboardNavCountHref(ROUTES.analytics)).toBe(false);
  });
});
