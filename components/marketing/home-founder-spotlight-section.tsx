import Link from "next/link";

import { AfricaInnovationBlueprint } from "@/components/marketing/africa-innovation-blueprint";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { HomePageCopy } from "@/types/marketing-page";
import type { StartupCountryReach } from "@/types/startup";

type HomeFounderSpotlightSectionProps = {
  locale: Locale;
  copy: HomePageCopy["founders"];
  className?: string;
  countryReach: StartupCountryReach[];
};

/**
 * Home Module 04 — Spotlight.
 * Light ecosystem blueprint schematic with founders section copy.
 */
export function HomeFounderSpotlightSection({
  locale,
  copy,
  className,
  countryReach,
}: HomeFounderSpotlightSectionProps) {
  const ctaHref = publicPath(locale, copy.cta.slug);

  return (
    <section
      id="founder-spotlight"
      aria-labelledby="home-founder-spotlight-heading"
      className={cn(
        "relative overflow-hidden border-y border-border bg-background",
        "px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
        "[content-visibility:auto] [contain-intrinsic-size:auto_28rem]",
        className,
      )}
    >
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="relative order-2 lg:order-1 lg:col-span-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(23,145,145,0.1),transparent_62%)]"
          />
          <AfricaInnovationBlueprint
            tone="light"
            titleBlock={copy.blueprintTitleBlock}
            countryReach={countryReach}
            className="relative h-auto w-full overflow-hidden rounded-sm shadow-[0_0_0_1px_rgba(20,51,59,0.1)]"
          />
        </div>

        <div className="relative z-10 order-1 max-w-xl lg:order-2 lg:col-span-5 lg:max-w-none">
          <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">
            Spotlight
          </p>
          <h2
            id="home-founder-spotlight-heading"
            className="mt-3 font-heading text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl lg:text-4xl"
          >
            {copy.title}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {copy.description}
          </p>
          <Link
            href={ctaHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "mt-8 min-h-11 w-full rounded-full border-foreground/25 bg-background px-8 sm:w-auto",
            )}
          >
            {copy.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
