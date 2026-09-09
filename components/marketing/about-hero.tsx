import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { MarketingPageCopy } from "@/types/marketing-page";

type AboutHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  heroChips?: MarketingPageCopy["heroChips"];
};

const SHAPE_CLASSES = [
  "about-hero-shape about-hero-shape--circle about-hero-shape--c1",
  "about-hero-shape about-hero-shape--circle about-hero-shape--c2",
  "about-hero-shape about-hero-shape--circle about-hero-shape--c4",
  "about-hero-shape about-hero-shape--circle about-hero-shape--c7",
  "about-hero-shape about-hero-shape--circle about-hero-shape--c8",
  "about-hero-shape about-hero-shape--ring about-hero-shape--r1",
  "about-hero-shape about-hero-shape--ring about-hero-shape--r3",
  "about-hero-shape about-hero-shape--square about-hero-shape--s1",
  "about-hero-shape about-hero-shape--square about-hero-shape--s3",
  "about-hero-shape about-hero-shape--diamond about-hero-shape--d1",
  "about-hero-shape about-hero-shape--diamond about-hero-shape--d3",
  "about-hero-shape about-hero-shape--pill about-hero-shape--p1",
  "about-hero-shape about-hero-shape--dot about-hero-shape--dot1",
  "about-hero-shape about-hero-shape--dot about-hero-shape--dot2",
  "about-hero-shape about-hero-shape--l1",
  "about-hero-shape about-hero-shape--l2",
] as const;

/**
 * About page hero — centered copy over floating shapes and decorative chips.
 * Adapted from `public/embedded/index.html` into ASIP ink / teal theme.
 */
export function AboutHero({
  eyebrow,
  title,
  description,
  action,
  heroChips,
}: AboutHeroProps) {
  return (
    <section
      className="about-hero relative isolate flex min-h-[min(64dvh,34rem)] items-center overflow-hidden bg-[#14333b] text-white sm:pt-20"
      aria-labelledby="about-hero-title"
    >
      <div className="about-hero__wash pointer-events-none absolute inset-0" aria-hidden />
      <div className="about-hero__grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="about-hero__dots pointer-events-none absolute inset-0" aria-hidden />

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {SHAPE_CLASSES.map((className) => (
          <span key={className} className={className} />
        ))}
      </div>

      {heroChips ? (
        <div
          className="about-hero-chips pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          {heroChips.chips.map((chip, index) => {
            const kindLabel =
              chip.kind === "focus" ? heroChips.focusKind : heroChips.chapterKind;

            return (
              <div
                key={`${chip.kind}-${chip.label}`}
                className={cn(
                  "about-hero-chip",
                  `about-hero-chip--${index + 1}`,
                  chip.kind === "focus"
                    ? "about-hero-chip--focus"
                    : "about-hero-chip--chapter",
                  chip.hideSm && "about-hero-chip--hide-sm",
                  chip.hideMd && "about-hero-chip--hide-md",
                )}
              >
                <div className="about-hero-chip__inner">
                  <span className="about-hero-chip__kind">{kindLabel}</span>
                  <span className="about-hero-chip__label">{chip.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div
        data-hero-copy
        className="relative z-10 mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24"
      >
        {eyebrow ? (
          <p className="text-sm font-semibold tracking-[0.22em] text-white/55 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1
          id="about-hero-title"
          className="mt-6 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]"
        >
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-pretty text-white/75 sm:text-lg sm:leading-8">
          {description}
        </p>
        {action ? (
          <div className="mt-8 flex justify-center sm:mt-9">{action}</div>
        ) : null}
      </div>
    </section>
  );
}
