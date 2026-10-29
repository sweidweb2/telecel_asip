import Image from "next/image";

import { HomeImpactGrowthIllustration } from "@/components/marketing/home-impact-growth-illustration";
import { AnimatedMetricValue } from "@/components/marketing/animated-metric-value";
import { HomeTealDotPattern } from "@/components/marketing/home-teal-dot-pattern";
import { metricPeriod } from "@/lib/marketing/metric-period";
import { cn } from "@/lib/utils";
import type { HomePageCopy } from "@/types/marketing-page";

export type HomeImpactYearsMetric = {
  id: string;
  claim_label: string;
  value: string;
  unit: string | null;
  period_start?: string | null;
  period_end?: string | null;
};

type HomeImpactYearsSectionProps = {
  copy: HomePageCopy["impactYears"];
  metrics: HomeImpactYearsMetric[];
  className?: string;
};

/**
 * Home Module 03 — Seven Years of Impact.
 * Slanted cream band (taller on the left); cutaway triangle under the
 * diagonal uses the same patterned teal as the platform section below.
 */
export function HomeImpactYearsSection({
  copy,
  metrics,
  className,
}: HomeImpactYearsSectionProps) {
  return (
    <section
      id="impact-years"
      aria-labelledby="home-impact-years-heading"
      className={cn("relative overflow-hidden bg-[#14333b]", className)}
    >
      {/* Same teal dots as platform — shows through the cutaway triangle */}
      <HomeTealDotPattern />

      {/* Cream plane is clipped; patterned teal underlay fills the right-hand triangle */}
      <div
        className={cn(
          "relative overflow-hidden bg-[linear-gradient(180deg,var(--brand-subtle)_0%,var(--background)_50%)]",
          /* Left taller than right — diagonal rises L→R */
          "[clip-path:polygon(0_0,100%_0,100%_72%,0_100%)]",
          "min-h-[30rem] px-4 pb-16 pt-12 sm:min-h-[34rem] sm:px-6 sm:pb-20 sm:pt-14 lg:min-h-[40rem] lg:px-8 lg:pb-24 lg:pt-16",
        )}
      >
        {/* Diagonal HR joining the slant — hidden on mobile where #2/#3 share the teal cutaway */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="100%"
            x2="100%"
            y2="72%"
            stroke="currentColor"
            strokeWidth="1.25"
            className="text-border"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Stairs sit on the bottom-right corner — not floating mid-section */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0 w-[min(104%,36rem)] origin-bottom-right sm:w-[min(94%,46rem)] lg:w-[min(64%,52rem)] xl:w-[min(60%,55rem)]"
        >
          <HomeImpactGrowthIllustration />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="max-w-xl lg:max-w-lg xl:max-w-xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">
              Impact
            </p>
            <h2
              id="home-impact-years-heading"
              className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl"
            >
              {copy.title}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-8">
              {copy.description}
            </p>

            {metrics.length > 0 ? (
              <ul className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6">
                {metrics.map((metric) => {
                  const period = metricPeriod(metric);
                  return <li key={metric.id} className="min-w-0" data-reveal="fade">
                    <p className="font-heading text-3xl font-semibold tracking-tight text-foreground metric-numeral sm:text-4xl">
                      <AnimatedMetricValue value={metric.value} />
                      {metric.unit ? (
                        <span className="ml-1 text-xl font-semibold text-muted-foreground sm:text-2xl">
                          {metric.unit}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {metric.claim_label}
                    </p>
                    {period ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{period}</p> : null}
                  </li>
                })}
              </ul>
            ) : null}

            {/* Charcoal kite sketch — transparent PNG under left copy */}
            <div
              aria-hidden
              className="impact-kite-float mt-8 ml-8 w-[min(100%,18rem)] sm:mt-10 sm:ml-12 sm:w-[min(100%,21rem)] lg:mt-12 lg:ml-14 lg:w-[min(100%,24rem)]"
            >
              <Image
                src="/asip-media/impact-kite-founder.webp"
                alt=""
                width={996}
                height={789}
                sizes="(max-width: 640px) 18rem, (max-width: 1024px) 21rem, 24rem"
                className="h-auto w-full select-none bg-transparent object-contain"
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
