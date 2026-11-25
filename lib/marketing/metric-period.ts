import type { Locale } from "@/constants/locales";

type MetricPeriodFields = {
  period_start?: string | null;
  period_end?: string | null;
};

/** "2019 to 2025" / "2025" from a metric's measurement period, or null. */
export function metricPeriod(
  metric: MetricPeriodFields,
  locale: Locale = "en",
): string | null {
  if (!metric.period_start && !metric.period_end) return null;
  const year = (value?: string | null) => value?.slice(0, 4);
  const start = year(metric.period_start);
  const end = year(metric.period_end);
  if (start && end && start !== end) {
    return locale === "fr" ? `${start} à ${end}` : `${start} to ${end}`;
  }
  return end ?? start ?? null;
}
