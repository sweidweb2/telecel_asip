import { describe, expect, it } from "vitest";

import {
  ADMIN_PERF_DEFAULT_PAGE_SIZE,
  adminPerfListFilterParams,
  parseAdminPerfListQuery,
} from "@/validations/admin-perf-events";

describe("parseAdminPerfListQuery", () => {
  it("parses page, pageSize, search, and filters", () => {
    expect(
      parseAdminPerfListQuery({
        page: "3",
        pageSize: "50",
        search: "  getBlogs ",
        eventType: "data_read",
        cacheStatus: "miss",
      }),
    ).toEqual({
      page: 3,
      pageSize: 50,
      search: "getBlogs",
      eventType: "data_read",
      cacheStatus: "miss",
    });
  });

  it("falls back to defaults for missing or invalid values", () => {
    expect(parseAdminPerfListQuery({})).toEqual({
      page: 1,
      pageSize: ADMIN_PERF_DEFAULT_PAGE_SIZE,
      search: "",
      eventType: "all",
      cacheStatus: "all",
    });

    expect(
      parseAdminPerfListQuery({
        page: "-1",
        pageSize: "999",
        eventType: "nope",
        cacheStatus: "warm",
        search: "bad%name",
      }),
    ).toEqual({
      page: 1,
      pageSize: ADMIN_PERF_DEFAULT_PAGE_SIZE,
      search: "",
      eventType: "all",
      cacheStatus: "all",
    });
  });
});

describe("adminPerfListFilterParams", () => {
  it("omits default pageSize and all-filters", () => {
    expect(
      adminPerfListFilterParams({
        page: 2,
        pageSize: ADMIN_PERF_DEFAULT_PAGE_SIZE,
        search: "",
        eventType: "all",
        cacheStatus: "all",
      }),
    ).toEqual({
      search: undefined,
      eventType: undefined,
      cacheStatus: undefined,
      pageSize: undefined,
    });
  });

  it("keeps active filters and a non-default pageSize", () => {
    expect(
      adminPerfListFilterParams({
        page: 1,
        pageSize: 50,
        search: "upload",
        eventType: "mutation",
        cacheStatus: "n_a",
      }),
    ).toEqual({
      search: "upload",
      eventType: "mutation",
      cacheStatus: "n_a",
      pageSize: "50",
    });
  });
});
