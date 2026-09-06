import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  TreeGlyph,
  TreeHeroField,
} from "@/components/marketing/tree-hero-field";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { MarketingPageCopy } from "@/types/marketing-page";

type FoundersHeroSectionProps = {
  locale: Locale;
  copy: Pick<
    MarketingPageCopy,
    "eyebrow" | "title" | "description" | "cta"
  >;
  className?: string;
};

/**
 * Founders directory hero — same centered tree composition as Programme,
 * on the primary ink surface instead of light.
 */
export function FoundersHeroSection({
  locale,
  copy,
  className,
}: FoundersHeroSectionProps) {
  const ctaHref = copy.cta ? publicPath(locale, copy.cta.slug) : null;

  return (
    <section
      aria-labelledby="founders-hero-heading"
      className={cn(
        "relative isolate overflow-hidden border-b border-white/10 bg-[#14333b] text-white",
        className,
      )}
    >
      <TreeHeroField tone="primary" patternId="founders-hero-tree-tile" />

      <div className="relative mx-auto flex min-h-[28rem] w-full max-w-3xl flex-col items-center justify-center px-4 pt-8 pb-14 text-center sm:min-h-[32rem] sm:px-6 sm:pt-10 sm:pb-16 lg:min-h-[36rem] lg:px-8 lg:pt-12 lg:pb-20">
        <div data-hero-copy className="flex w-full flex-col items-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#9ad1bf] shadow-sm backdrop-blur-sm">
            <TreeGlyph className="size-4 shrink-0" />
            {copy.eyebrow}
          </p>

          <h1
            id="founders-hero-heading"
            className="mt-6 max-w-3xl font-heading text-4xl font-semibold leading-[1.08] text-balance text-white sm:text-5xl lg:text-6xl"
          >
            {copy.title}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:mt-6 sm:text-lg sm:leading-8">
            {copy.description}
          </p>

          {copy.cta && ctaHref ? (
            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href={ctaHref}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "min-h-11 w-full rounded-full px-8 sm:w-auto",
                )}
              >
                {copy.cta.label}
                <ArrowRight data-icon="inline-end" aria-hidden />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
