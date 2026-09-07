import claimLabels from "@/constants/impact-claim-labels.json";
import displayLocations from "@/constants/impact-display-locations.json";
import geographies from "@/constants/impact-geographies.json";

export const IMPACT_CLAIM_LABELS = claimLabels as readonly string[];
export const IMPACT_GEOGRAPHIES = geographies as readonly string[];
export const IMPACT_DISPLAY_LOCATION_OPTIONS =
  displayLocations as readonly string[];

export const IMPACT_SUGGESTION_LIMIT = 6;

function filterSuggestions(
  catalog: readonly string[],
  value: string,
  limit: number,
): string[] {
  const q = value.trim().toLowerCase();
  const matched = q
    ? catalog.filter((item) => item.toLowerCase().includes(q))
    : [...catalog];
  return matched.slice(0, limit);
}

/** Filter claim-label suggestions by the full field value. */
export function filterImpactClaimLabels(
  value: string,
  limit = IMPACT_SUGGESTION_LIMIT,
): string[] {
  return filterSuggestions(IMPACT_CLAIM_LABELS, value, limit);
}

/** Filter geography suggestions by the full field value. */
export function filterImpactGeographies(
  value: string,
  limit = IMPACT_SUGGESTION_LIMIT,
): string[] {
  return filterSuggestions(IMPACT_GEOGRAPHIES, value, limit);
}

/**
 * Current line being typed: text after the last newline.
 * A trailing newline means a new location has started (empty token).
 */
export function getImpactDisplayLocationActiveLine(value: string): string {
  const lastBreak = value.lastIndexOf("\n");
  if (lastBreak === -1) return value;
  return value.slice(lastBreak + 1);
}

/**
 * Replace the active (last) line with a chosen suggestion.
 * Keeps any completed lines before the last newline.
 */
export function applyImpactDisplayLocationSuggestion(
  value: string,
  suggestion: string,
): string {
  const lastBreak = value.lastIndexOf("\n");
  if (lastBreak === -1) return suggestion;
  const prefix = value.slice(0, lastBreak).replace(/\n+$/, "");
  return prefix ? `${prefix}\n${suggestion}` : suggestion;
}

/**
 * Filter display-location suggestions by the active line only.
 * Empty active line returns the first N entries as browse hints.
 */
export function filterImpactDisplayLocations(
  value: string,
  limit = IMPACT_SUGGESTION_LIMIT,
): string[] {
  const q = getImpactDisplayLocationActiveLine(value).trim().toLowerCase();
  const matched = q
    ? IMPACT_DISPLAY_LOCATION_OPTIONS.filter((item) =>
        item.toLowerCase().includes(q),
      )
    : [...IMPACT_DISPLAY_LOCATION_OPTIONS];
  return matched.slice(0, limit);
}
