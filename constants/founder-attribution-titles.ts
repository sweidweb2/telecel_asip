import titles from "@/constants/founder-attribution-titles.json";

/** Suggested attribution titles for the founder-quote editor typeahead. */
export const FOUNDER_ATTRIBUTION_TITLES = titles as readonly string[];

export const FOUNDER_ATTRIBUTION_TITLE_SUGGESTION_LIMIT = 6;

/**
 * Filter title suggestions by the current field value.
 * Empty query returns the first N entries as browse hints.
 */
export function filterFounderAttributionTitles(
  value: string,
  limit = FOUNDER_ATTRIBUTION_TITLE_SUGGESTION_LIMIT,
): string[] {
  const q = value.trim().toLowerCase();
  const matched = q
    ? FOUNDER_ATTRIBUTION_TITLES.filter((title) =>
        title.toLowerCase().includes(q),
      )
    : [...FOUNDER_ATTRIBUTION_TITLES];
  return matched.slice(0, limit);
}
