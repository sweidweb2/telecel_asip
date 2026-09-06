import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Globe2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";
import { cn } from "@/lib/utils";
import type {
  HomeOutcomeFeatureId,
  HomePageCopy,
} from "@/types/marketing-page";

const FEATURE_ICONS: Record<HomeOutcomeFeatureId, LucideIcon> = {
  businesses: Building2,
  markets: Globe2,
  readiness: TrendingUp,
};

type HomeOutcomesSectionProps = {
  locale: Locale;
  copy: HomePageCopy["outcomes"];
  openApplications: boolean;
  className?: string;
};

/**
 * Home Module 05 — Impact outcomes.
 * Light two-column layout: copy + intake CTA on the left; oversized visual bleeds right.
 */
export function HomeOutcomesSection({
  locale,
  copy,
  openApplications,
  className,
}: HomeOutcomesSectionProps) {
  const intake = intakeCtaFor(locale, openApplications);
  const impactHref = publicPath(locale, copy.cta.slug);

  return (
    <section
      id="outcomes"
      aria-labelledby="home-outcomes-heading"
      className={cn(
        "overflow-hidden border-b border-border bg-background",
        "px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-14">
          <div className="min-w-0 lg:max-w-xl lg:pr-4">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">
              {copy.eyebrow}
            </p>
            <h2
              id="home-outcomes-heading"
              className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl"
            >
              {copy.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-8">
              {copy.description}
            </p>

            <dl className="mt-8 max-w-xl space-y-6 sm:mt-10 sm:space-y-8">
              {copy.features.map((feature) => {
                const Icon = FEATURE_ICONS[feature.id];

                return (
                  <div key={feature.id} className="relative pl-9">
                    <dt className="inline font-semibold text-foreground">
                      <Icon
                        className="absolute top-1 left-0 size-5 text-brand"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      {feature.title}
                    </dt>{" "}
                    <dd className="inline text-base leading-7 text-muted-foreground">
                      {feature.description}
                    </dd>
                  </div>
                );
              })}
            </dl>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href={intake.href}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "min-h-11 w-full rounded-full px-8 sm:w-auto",
                )}
              >
                {intake.label}
              </Link>
              <Link
                href={impactHref}
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "min-h-11 w-full rounded-full border-foreground/20 px-8 sm:w-auto",
                )}
              >
                {copy.cta.label}
              </Link>
            </div>
          </div>

          <div className="relative min-w-0 justify-self-center lg:justify-self-start">
            <Image
              src="/my-images/window.png"
              alt={copy.imageAlt}
              width={1536}
              height={1024}
              sizes="(max-width: 1024px) 100vw, 48rem"
              className={cn(
                "mx-auto h-auto w-full max-w-none rounded-xl object-cover shadow-lg ring-1 ring-border/60",
                /* Oversized from lg so the right edge clips outside the section */
                "lg:mx-0 lg:w-[42rem] xl:w-[48rem]",
              )}
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
