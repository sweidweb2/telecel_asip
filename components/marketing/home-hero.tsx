import Link from "next/link";

import { HomeHeroContinuum } from "@/components/marketing/home-hero-continuum";
import { buttonVariants } from "@/components/ui/button";
import { homeHeroContinuumAlt } from "@/constants/home-hero-media";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { IntakeCta } from "@/lib/marketing/intake-cta";
import { cn } from "@/lib/utils";
import type { HomePageCopy } from "@/types/marketing-page";

type HomeHeroProps = {
  locale: Locale;
  copy: HomePageCopy["hero"];
  intake: IntakeCta;
};

/**
 * Home Module 01 — Founder Continuum.
 * Full-bleed stills soft-crossfade behind a stable brand + headline + CTA lockup.
 * Continuum media is a small client island (≤2 stills); reduced-motion freezes on the first.
 */
export function HomeHero({ locale, copy, intake }: HomeHeroProps) {
  const primaryHref = publicPath(locale, copy.primaryCta.slug);
  const continuumLabel = homeHeroContinuumAlt(locale, 0);

  return (
    <section
      aria-label={continuumLabel}
      className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-[#14333b] text-white sm:min-h-[80svh] md:min-h-[calc(100svh-5.5rem)]"
    >
      <div className="absolute inset-0" aria-hidden>
        <HomeHeroContinuum />
      </div>

      <div
        data-hero-copy
        className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-6 pb-4 sm:px-6 sm:pt-14 sm:pb-32 lg:px-8 lg:pt-16 lg:pb-36 max-md:-translate-y-14"
      >
        <div>
          <p className="font-heading text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {copy.brand}
          </p>
          <span
            aria-hidden
            className="home-hero-brand-rule mt-2.5 block h-0.5 w-14 bg-asip-coral sm:mt-4 sm:w-16"
          />
          <p className="mt-3 max-w-xl text-xs font-semibold tracking-[0.16em] text-asip-mint uppercase sm:mt-4 sm:text-sm">
            {copy.eyebrow}
          </p>
        </div>

        <h1 className="mt-4 max-w-4xl font-heading text-3xl font-semibold leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
          {copy.title}
        </h1>

        <p className="mt-4 max-w-xl border-l-2 border-asip-coral pl-4 text-base leading-7 text-white/80 sm:mt-6 sm:pl-5 sm:text-lg sm:leading-8">
          {copy.description}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Link
            href={primaryHref}
            className={cn(
              buttonVariants({ size: "lg" }),
              "min-h-11 w-full rounded-full bg-asip-coral px-8 text-white hover:bg-asip-coral-hover sm:w-auto",
            )}
          >
            {copy.primaryCta.label}
          </Link>
          <Link
            href={intake.href}
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "min-h-11 w-full rounded-full border-white/55 bg-white/5 px-8 text-white hover:bg-white hover:text-asip-ink sm:w-auto",
            )}
          >
            {intake.label}
          </Link>
        </div>

        <span className="sr-only">{continuumLabel}</span>
      </div>

      <svg
        aria-hidden
        className="home-hero-signal pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-14 w-full text-asip-mint/45 sm:h-36"
        viewBox="0 0 1200 150"
        preserveAspectRatio="none"
      >
        {/*
          Paths run past both edges (clipped by the hero) so the stroke always
          reads edge-to-edge after the dash draw finishes.
        */}
        <path
          className="home-hero-signal__line"
          d="M-40 128 C120 108 200 142 340 100 S520 50 680 86 S860 130 1000 92 S1120 60 1240 78"
        />
        <path
          className="home-hero-signal__line home-hero-signal__line--secondary"
          d="M-40 150 C140 120 260 136 400 112 S620 124 800 80 S980 44 1120 58 S1200 70 1240 64"
        />
        {[340, 680, 1000, 1180].map((cx, index) => (
          <circle
            key={cx}
            className="home-hero-signal__node"
            style={{ animationDelay: `${index * 550}ms` }}
            cx={cx}
            cy={index === 0 ? 100 : index === 1 ? 86 : index === 2 ? 92 : 74}
            r="3.5"
          />
        ))}
      </svg>
    </section>
  );
}
