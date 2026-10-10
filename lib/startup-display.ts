/**
 * Initials for startup logo placeholder (1–2 letters from the name).
 */
export function startupInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

/**
 * ASIP spectrum accent per cohort, keyed by its (first) year so every
 * cohort keeps the same colour across cards, chips and filters.
 * Classes are literal so Tailwind can see them.
 */
const COHORT_ACCENTS = [
  { bar: "bg-brand", chip: "bg-brand text-white" },
  { bar: "bg-asip-magenta", chip: "bg-asip-magenta text-white" },
  { bar: "bg-asip-coral", chip: "bg-asip-coral text-white" },
  { bar: "bg-asip-mint", chip: "bg-asip-mint text-asip-ink" },
  { bar: "bg-asip-ink", chip: "bg-asip-ink text-white" },
] as const;

export type CohortAccent = (typeof COHORT_ACCENTS)[number];

export function cohortAccent(cohort: string | null): CohortAccent {
  const year = cohort ? /\d{4}/.exec(cohort)?.[0] : undefined;
  const key = year
    ? Number(year)
    : [...(cohort ?? "")].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return COHORT_ACCENTS[key % COHORT_ACCENTS.length]!;
}

/** Localised country name from an ISO alpha-2 code; falls back to the code. */
export function countryDisplayName(
  code: string | null,
  locale: "en" | "fr",
): string | null {
  if (!code) return null;
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Extract YYYY from a Postgres `date` (YYYY-MM-DD) or ISO string. */
export function foundedYearFromDate(value: string | null): string | null {
  if (!value) return null;
  const match = /^(\d{4})/.exec(value.trim());
  return match?.[1] ?? null;
}

/**
 * Format a Postgres `date` (YYYY-MM-DD) without UTC timezone shift.
 */
export function formatFoundedDate(
  value: string,
  locale: "en" | "fr" = "en",
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return value;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
