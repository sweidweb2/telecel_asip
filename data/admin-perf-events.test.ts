import { describe, expect, it } from "vitest";

import { mapAdminPerfAnalytics } from "@/data/admin-perf-events";

describe("mapAdminPerfAnalytics", () => {
  it("maps the SQL payload into chart rows", () => {
    expect(
      mapAdminPerfAnalytics({
        total: 4,
        hitRatio: "0.5",
        byEventType: [{ eventType: "page", count: 3 }],
        slowest: [
          {
            name: "loadBlogs",
            count: 2,
            avgMs: 12.5,
            p95Ms: 20,
            hitCount: 1,
            missCount: 1,
            hitAvgMs: 4,
            missAvgMs: 21,
          },
        ],
        overTime: [{ bucket: "2026-10-09T20:00", count: 4, hit: 1, miss: 2 }],
      }),
    ).toEqual({
      total: 4,
      hitRatio: 0.5,
      byEventType: [{ eventType: "page", count: 3 }],
      slowest: [
        {
          name: "loadBlogs",
          count: 2,
          avgMs: 12.5,
          p95Ms: 20,
          hitCount: 1,
          missCount: 1,
          hitAvgMs: 4,
          missAvgMs: 21,
        },
      ],
      overTime: [{ bucket: "2026-10-09T20:00", count: 4, hit: 1, miss: 2 }],
    });
  });

  it("returns empty analytics for a missing payload", () => {
    expect(mapAdminPerfAnalytics(null)).toEqual({
      total: 0,
      hitRatio: 0,
      byEventType: [],
      slowest: [],
      overTime: [],
    });
  });
});
