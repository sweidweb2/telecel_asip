import locations from "@/constants/event-locations.json";

/** Suggested location labels for the event editor typeahead. */
export const EVENT_LOCATIONS = locations as readonly string[];

export const EVENT_LOCATION_SUGGESTION_LIMIT = 6;

/**
 * Filter location suggestions by the current field value.
 * Empty query returns the first N entries as browse hints.
 */
export function filterEventLocations(
  value: string,
  limit = EVENT_LOCATION_SUGGESTION_LIMIT,
): string[] {
  const q = value.trim().toLowerCase();
  const matched = q
    ? EVENT_LOCATIONS.filter((location) => location.toLowerCase().includes(q))
    : [...EVENT_LOCATIONS];
  return matched.slice(0, limit);
}
