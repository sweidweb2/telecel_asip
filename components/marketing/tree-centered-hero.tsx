import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  TreeGlyph,
  TreeHeroField,
} from "@/components/marketing/tree-hero-field";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TreeCenteredHeroCta = {
  href: string;
  label: string;
};

type TreeCenteredHeroProps = {
  tone: "light" | "primary";
  patternId: string;
  eyebrow: string;
  title: string;
  description: string;
  /** Optional stable id for the h1 (founders directory). */
  headingId?: string;
  primaryCta?: TreeCenteredHeroCta;
  secondaryCta?: TreeCenteredHeroCta;
  className?: string;
  /**
   * Density of the hero stack.
   * - `tall` — programme (more vertical room)
   * - `compact` — founders directory
   */
  density?: "tall" | "compact";
};

/**
 * Shared centered stack over a branching-tree field.
 * Used by Programme (light) and Founders directory (primary ink).
 */
export function TreeCenteredHero({
  tone,
  patternId,
  eyebrow,
  title,
  description,
  headingId,
  primaryCta,
  secondaryCta,
  className,
  density = "tall",
}: TreeCenteredHeroProps) {
  const isLight = tone === "light";
  const hasCtas = Boolean(primaryCta || secondaryCta);

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "relative isolate overflow-hidden border-b",
        isLight
          ? "border-border bg-background text-foreground"
          : "border-white/10 bg-asip-ink text-white",
        className,
      )}
    >
      <TreeHeroField tone={tone} patternId={patternId} />

      <div
        className={cn(
          "relative mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8",
          density === "tall"
            ? "min-h-[36rem] py-16 sm:min-h-[40rem] sm:py-20 lg:min-h-[44rem] lg:py-24"
            : "min-h-[28rem] pt-8 pb-14 sm:min-h-[32rem] sm:pt-10 sm:pb-16 lg:min-h-[36rem] lg:pt-12 lg:pb-20",
        )}
      >
        <div data-hero-copy className="flex w-full flex-col items-center">
          <p
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm",
              isLight
                ? "border-border bg-background/80 text-primary"
                : "border-white/15 bg-white/10 text-asip-mint",
            )}
          >
            <TreeGlyph className="size-4 shrink-0" />
            {eyebrow}
          </p>

          <h1
            id={headingId}
            className={cn(
              "mt-6 max-w-3xl font-heading text-4xl font-semibold leading-[1.08] text-balance sm:text-5xl lg:text-6xl",
              !isLight && "text-white",
            )}
          >
            {title}
          </h1>

          <p
            className={cn(
              "mt-5 max-w-xl text-base leading-7 sm:mt-6 sm:text-lg sm:leading-8",
              isLight ? "text-muted-foreground" : "text-white/70",
            )}
          >
            {description}
          </p>

          {hasCtas ? (
            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:items-center">
              {primaryCta ? (
                <Link
                  href={primaryCta.href}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "min-h-11 w-full rounded-full px-8 sm:w-auto",
                  )}
                >
                  {primaryCta.label}
                  <ArrowRight data-icon="inline-end" aria-hidden />
                </Link>
              ) : null}
              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "min-h-11 w-full rounded-full px-8 sm:w-auto",
                    isLight && "bg-background/70 backdrop-blur-sm",
                  )}
                >
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
