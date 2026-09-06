import { describe, expect, it } from "vitest";

import {
  EVENT_LOCATIONS,
  EVENT_LOCATION_SUGGESTION_LIMIT,
  filterEventLocations,
} from "@/constants/event-locations";

describe("filterEventLocations", () => {
  it("returns browse hints when the query is empty", () => {
    expect(filterEventLocations("")).toEqual(
      EVENT_LOCATIONS.slice(0, EVENT_LOCATION_SUGGESTION_LIMIT),
    );
  });

  it("filters by substring match", () => {
    const result = filterEventLocations("acc");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((location) => /acc/i.test(location))).toBe(true);
  });

  it("caps results at the suggestion limit", () => {
    const result = filterEventLocations("a");
    expect(result.length).toBeLessThanOrEqual(EVENT_LOCATION_SUGGESTION_LIMIT);
  });
});
