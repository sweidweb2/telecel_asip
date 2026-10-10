type MetricPeriodFields = {
  period_start?: string | null;
  period_end?: string | null;
};

/** "2019–2025" / "2025" from a metric's measurement period, or null. */
export function metricPeriod(metric: MetricPeriodFields): string | null {
  if (!metric.period_start && !metric.period_end) return null;
  const year = (value?: string | null) => value?.slice(0, 4);
  const start = year(metric.period_start);
  const end = year(metric.period_end);
  return (start && end && start !== end ? `${start}–${end}` : end ?? start) ?? null;
}
