import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  TreeGlyph,
  TreeHeroField,
} from "@/components/marketing/tree-hero-field";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";
import { cn } from "@/lib/utils";
import type { ProgrammePageCopy } from "@/types/marketing-page";

type ProgrammeHeroProps = {
  locale: Locale;
  copy: ProgrammePageCopy["hero"];
  openApplications: boolean;
};

/**
 * Programme hero — light-mode centered stack over a branching-tree field.
 */
export function ProgrammeHero({
  locale,
  copy,
  openApplications,
}: ProgrammeHeroProps) {
  const intake = intakeCtaFor(locale, openApplications);
  const secondaryHref = publicPath(locale, copy.secondaryCta.slug);

  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-background text-foreground">
      <TreeHeroField tone="light" patternId="programme-hero-tree-tile" />

      <div className="relative mx-auto flex min-h-[36rem] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[40rem] sm:px-6 sm:py-20 lg:min-h-[44rem] lg:px-8 lg:py-24">
        <div data-hero-copy className="flex w-full flex-col items-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm backdrop-blur-sm">
            <TreeGlyph className="size-4 shrink-0" />
            {copy.eyebrow}
          </p>

          <h1 className="mt-6 max-w-3xl font-heading text-4xl font-semibold leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
            {copy.title}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8">
            {copy.description}
          </p>

          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href={intake.href}
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-h-11 w-full rounded-full px-8 sm:w-auto",
              )}
            >
              {intake.label}
              <ArrowRight data-icon="inline-end" aria-hidden />
            </Link>
            <Link
              href={secondaryHref}
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "min-h-11 w-full rounded-full bg-background/70 px-8 backdrop-blur-sm sm:w-auto",
              )}
            >
              {copy.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
