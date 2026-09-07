import { describe, expect, it } from "vitest";

import {
  findFirstAvailableSortOrder,
  getPartnerSortOrderPageBounds,
  getPartnerSortOrderPageCount,
  getPartnerSortOrderPageForValue,
  getPartnerSortOrderRange,
  planSortOrderDisplacement,
  type PartnerSortOrderOccupant,
} from "@/lib/partners/sort-order";
import {
  PARTNER_SORT_ORDER_MAX,
  PARTNER_SORT_ORDER_MIN,
  PARTNER_SORT_ORDER_PAGE_SIZE,
} from "@/validations/partner";

const partners: PartnerSortOrderOccupant[] = [
  { id: "a", name: "Alpha", sort_order: 1 },
  { id: "b", name: "Beta", sort_order: 2 },
  { id: "c", name: "Gamma", sort_order: 4 },
];

describe("findFirstAvailableSortOrder", () => {
  it("returns the minimum when nothing is taken", () => {
    expect(findFirstAvailableSortOrder([])).toBe(PARTNER_SORT_ORDER_MIN);
  });

  it("skips occupied and reserved slots", () => {
    expect(findFirstAvailableSortOrder([1, 2, 4], [3])).toBe(5);
  });
});

describe("planSortOrderDisplacement", () => {
  it("returns null when the order is free", () => {
    expect(
      planSortOrderDisplacement({
        desiredOrder: 3,
        currentPartnerId: "a",
        partners,
      }),
    ).toBeNull();
  });

  it("moves the occupant to the first free slot", () => {
    expect(
      planSortOrderDisplacement({
        desiredOrder: 2,
        currentPartnerId: "a",
        partners,
      }),
    ).toEqual({
      displace: { id: "b", name: "Beta", toOrder: 3 },
    });
  });

  it("ignores the current partner occupying their own order", () => {
    expect(
      planSortOrderDisplacement({
        desiredOrder: 1,
        currentPartnerId: "a",
        partners,
      }),
    ).toBeNull();
  });
});

describe("getPartnerSortOrderRange", () => {
  it("is always 1–170", () => {
    expect(getPartnerSortOrderRange()).toEqual({
      min: PARTNER_SORT_ORDER_MIN,
      max: PARTNER_SORT_ORDER_MAX,
    });
  });
});

describe("sort order pagination", () => {
  it("puts 1–170 on page 1", () => {
    expect(PARTNER_SORT_ORDER_PAGE_SIZE).toBe(170);
    expect(getPartnerSortOrderPageCount()).toBe(1);
    expect(getPartnerSortOrderPageBounds(1)).toEqual({ start: 1, end: 170 });
  });

  it("maps a selected value to its page", () => {
    expect(getPartnerSortOrderPageForValue(1)).toBe(1);
    expect(getPartnerSortOrderPageForValue(170)).toBe(1);
  });
});
