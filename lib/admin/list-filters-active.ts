/**
 * Whether a CMS/inbox list query has non-default filters applied.
 * Pass the same values you put in pagination `filters` (omit page / pageSize).
 * Empty string and `"all"` count as inactive; other strings are active.
 */
export function adminListFiltersActive(
  filters: Record<string, string | number | undefined | null>,
): boolean {
  return Object.values(filters).some((value) => {
    if (value == null) return false;
    if (typeof value === "number") return false;
    const trimmed = value.trim();
    return trimmed !== "" && trimmed !== "all";
  });
}
