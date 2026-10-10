import { BadgeCheck } from "lucide-react";

import { AnimatedMetricValue } from "@/components/marketing/animated-metric-value";
import { metricPeriod } from "@/lib/marketing/metric-period";
import { cn } from "@/lib/utils";
import type { ImpactMetricPublicItem } from "@/types/impact-metric";
import type { ImpactPageCopy } from "@/types/marketing-page";

/** Accent rules walk the ASIP spectrum across the proof grid. */
const ACCENTS = [
  "bg-asip-mint",
  "bg-asip-magenta",
  "bg-asip-coral",
  "bg-brand",
] as const;

type ImpactProofNumbersSectionProps = {
  copy: ImpactPageCopy["proof"];
  metrics: ImpactMetricPublicItem[];
};

/**
 * Impact proof band — large animated numbers.
 * Only `verified` impact metrics reach this component (see
 * `getImpactPageMetrics`), so every figure has cleared the evidence rule.
 * With none verified it shows the pending note instead of placeholder stats.
 */
export function ImpactProofNumbersSection({
  copy,
  metrics,
}: ImpactProofNumbersSectionProps) {
  return (
    <section
      aria-labelledby="impact-proof-heading"
      className="relative overflow-hidden bg-asip-ink text-white"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-asip-mint uppercase">
          {copy.eyebrow}
        </p>
        <h2
          id="impact-proof-heading"
          className="mt-3 max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          {copy.title}
        </h2>

        {metrics.length > 0 ? (
          <ul className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.slice(0, 8).map((metric, index) => {
              const period = metricPeriod(metric);
              return (
                <li
                  key={metric.id}
                  data-reveal="fade"
                  className="relative bg-asip-ink p-6 sm:p-7"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-0 left-6 h-1 w-10 rounded-b-full sm:left-7",
                      ACCENTS[index % ACCENTS.length],
                    )}
                  />
                  <p className="font-heading text-5xl font-semibold tracking-tight metric-numeral sm:text-6xl">
                    <AnimatedMetricValue value={metric.value} />
                    {metric.unit ? (
                      <span className="ml-1.5 text-2xl font-semibold text-white/60 sm:text-3xl">
                        {metric.unit}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/80">
                    {metric.claim_label}
                  </p>
                  <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] font-semibold tracking-[0.12em] text-white/55 uppercase">
                    <span className="inline-flex items-center gap-1 text-asip-mint">
                      <BadgeCheck aria-hidden className="size-3.5" />
                      {copy.verifiedLabel}
                    </span>
                    {period ? <span>{period}</span> : null}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-8 max-w-2xl border-l-2 border-asip-mint pl-4 text-base leading-7 text-white/70">
            {copy.pending}
          </p>
        )}
      </div>
    </section>
  );
}
