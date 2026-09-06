import {
  PARTNER_SORT_ORDER_MAX,
  PARTNER_SORT_ORDER_MIN,
  PARTNER_SORT_ORDER_PAGE_SIZE,
} from "@/validations/partner";

export type PartnerSortOrderOccupant = {
  id: string;
  name: string;
  sort_order: number;
};

/**
 * Smallest free display order ≥ MIN that is not already used or reserved.
 */
export function findFirstAvailableSortOrder(
  occupiedOrders: readonly number[],
  reservedOrders: readonly number[] = [],
): number {
  const used = new Set<number>();
  for (const order of occupiedOrders) {
    if (
      Number.isInteger(order) &&
      order >= PARTNER_SORT_ORDER_MIN &&
      order <= PARTNER_SORT_ORDER_MAX
    ) {
      used.add(order);
    }
  }
  for (const order of reservedOrders) {
    if (
      Number.isInteger(order) &&
      order >= PARTNER_SORT_ORDER_MIN &&
      order <= PARTNER_SORT_ORDER_MAX
    ) {
      used.add(order);
    }
  }

  let slot = PARTNER_SORT_ORDER_MIN;
  while (used.has(slot) && slot <= PARTNER_SORT_ORDER_MAX) {
    slot += 1;
  }
  return Math.min(slot, PARTNER_SORT_ORDER_MAX);
}

/**
 * If `desiredOrder` is taken by another partner, move that partner to the
 * first free slot (reserving `desiredOrder` for the editor partner).
 */
export function planSortOrderDisplacement(args: {
  desiredOrder: number;
  currentPartnerId?: string;
  partners: readonly PartnerSortOrderOccupant[];
}): { displace: { id: string; name: string; toOrder: number } } | null {
  const { desiredOrder, currentPartnerId, partners } = args;

  const occupant = partners.find(
    (partner) =>
      partner.sort_order === desiredOrder &&
      partner.id !== currentPartnerId,
  );
  if (!occupant) return null;

  // Keep the editor partner's current order occupied until they move, so the
  // displaced partner lands in a free hole (not the editor's old slot mid-save).
  const others = partners.filter((partner) => partner.id !== occupant.id);

  const toOrder = findFirstAvailableSortOrder(
    others.map((partner) => partner.sort_order),
    [desiredOrder],
  );

  return {
    displace: {
      id: occupant.id,
      name: occupant.name,
      toOrder,
    },
  };
}

/** Full allowed map range (1 → 170). */
export function getPartnerSortOrderRange(): { min: number; max: number } {
  return { min: PARTNER_SORT_ORDER_MIN, max: PARTNER_SORT_ORDER_MAX };
}

export function getPartnerSortOrderPageCount(
  pageSize = PARTNER_SORT_ORDER_PAGE_SIZE,
): number {
  return Math.max(1, Math.ceil(PARTNER_SORT_ORDER_MAX / pageSize));
}

/** Inclusive start/end for a 1-based page within 1…MAX. */
export function getPartnerSortOrderPageBounds(
  page: number,
  pageSize = PARTNER_SORT_ORDER_PAGE_SIZE,
): { start: number; end: number } {
  const pageCount = getPartnerSortOrderPageCount(pageSize);
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize + PARTNER_SORT_ORDER_MIN;
  const end = Math.min(safePage * pageSize, PARTNER_SORT_ORDER_MAX);
  return { start, end };
}

export function getPartnerSortOrderPageForValue(
  value: number,
  pageSize = PARTNER_SORT_ORDER_PAGE_SIZE,
): number {
  const clamped = Math.min(
    Math.max(value, PARTNER_SORT_ORDER_MIN),
    PARTNER_SORT_ORDER_MAX,
  );
  return Math.min(
    Math.ceil(clamped / pageSize),
    getPartnerSortOrderPageCount(pageSize),
  );
}
