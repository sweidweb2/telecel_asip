import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";

import "./home-hero.css";

import { HomeHeroContinuum } from "@/components/marketing/home-hero-continuum";
import { HomeHeroSignal } from "@/components/marketing/home-hero-signal";
import { buttonVariants } from "@/components/ui/button";
import {
  HOME_HERO_CONTINUUM,
  homeHeroContinuumAlt,
} from "@/constants/home-hero-media";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { IntakeCta } from "@/lib/marketing/intake-cta";
import { cn } from "@/lib/utils";
import type { HomePageCopy } from "@/types/marketing-page";

/** LCP still — 75 is perceptually close at full-bleed and cuts decoder work. */
const HERO_LCP_QUALITY = 75;

/** ASIP multicolour spectrum — order matches the approved palette sweep. */
const SPECTRUM = [
  "bg-brand",
  "bg-asip-mint",
  "bg-asip-magenta",
  "bg-asip-coral",
] as const;

type HomeHeroProps = {
  locale: Locale;
  copy: HomePageCopy["hero"];
  intake: IntakeCta;
};

/**
 * Home Module 01 — Founder Continuum.
 * Full-bleed stills soft-crossfade behind a stable brand + headline + CTA lockup.
 * First still is RSC/LCP in the initial HTML; the client island only cycles later.
 *
 * Hierarchy: ASIP (brand) → Telecel (endorser) → founder headline → next step.
 * Energy comes from the ASIP spectrum rule and the mint last headline beat;
 * motion is a one-time CSS reveal and drops out under reduced motion.
 */
export function HomeHero({ locale, copy, intake }: HomeHeroProps) {
  const foundersHref = publicPath(locale, copy.primaryCta.slug);
  const continuumLabel = homeHeroContinuumAlt(locale, 0);
  const lcpSlide = HOME_HERO_CONTINUUM[0]!;
  const lastLine = copy.titleLines.length - 1;

  return (
    <section
      aria-label={continuumLabel}
      className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-[#14333b] text-white sm:min-h-[80svh] md:min-h-[calc(100svh-5.5rem)]"
    >
      <div className="absolute inset-0" aria-hidden>
        <HomeHeroContinuum
          lcpStill={
            <div
              className="home-hero-continuum-slide absolute inset-0"
              data-active="true"
              data-lcp="true"
            >
              <Image
                src={lcpSlide.src}
                alt=""
                fill
                priority
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className="object-cover"
                style={{ objectPosition: lcpSlide.position ?? "center" }}
                sizes="100vw"
                quality={HERO_LCP_QUALITY}
              />
            </div>
          }
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(20,51,59,.97)_0%,rgba(20,51,59,.88)_36%,rgba(20,51,59,.45)_62%,rgba(20,51,59,.18)_82%,rgba(20,51,59,.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,51,59,.55)_0%,transparent_42%)]" />
      </div>

      <div
        data-hero-copy
        className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 sm:pt-14 sm:pb-32 lg:px-8 lg:pt-16 lg:pb-36"
      >
        <div>
          <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
            <p className="font-heading text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {copy.brand}
            </p>
            <p className="mb-1.5 border-l border-white/30 pl-4 text-xs font-medium tracking-[0.08em] text-white/75 sm:mb-2.5 sm:text-sm">
              {copy.endorsement}
            </p>
          </div>
          <span
            aria-hidden
            className="mt-2.5 flex h-1 w-28 gap-1 sm:mt-4 sm:w-36"
          >
            {SPECTRUM.map((color, index) => (
              <span
                key={color}
                className={cn("home-hero-spectrum-seg h-full flex-1 rounded-full", color)}
                style={{ animationDelay: `${350 + index * 110}ms` }}
              />
            ))}
          </span>
          <p className="mt-3 max-w-xl text-xs font-semibold tracking-[0.16em] text-asip-mint uppercase sm:mt-4 sm:text-sm">
            {copy.eyebrow}
          </p>
        </div>

        <h1
          aria-label={copy.title}
          className="mt-4 max-w-4xl font-heading text-3xl font-semibold leading-[1.08] text-balance sm:text-5xl lg:text-6xl"
        >
          {copy.titleLines.map((line, index) => (
            <span
              key={line}
              aria-hidden
              className={cn(
                "home-hero-line inline-block pr-[0.25em]",
                index === lastLine && "home-hero-line--accent",
              )}
              style={{ animationDelay: `${180 + index * 140}ms` }}
            >
              {line}
            </span>
          ))}
        </h1>

        <p className="mt-4 max-w-xl border-l-2 border-asip-coral pl-4 text-base leading-7 text-white/80 sm:mt-6 sm:pl-5 sm:text-lg sm:leading-8">
          {copy.description}
        </p>

        <div>
          <div className="mt-6 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Link
              href={intake.href}
              className={cn(
                buttonVariants({ size: "lg" }),
                "group min-h-12 w-full rounded-full bg-asip-coral px-8 text-base text-white hover:bg-asip-coral-hover sm:w-auto",
              )}
            >
              {intake.label}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href={foundersHref}
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "min-h-12 w-full rounded-full border-white/55 bg-white/5 px-8 text-base text-white hover:bg-white hover:text-asip-ink sm:w-auto",
              )}
            >
              {copy.primaryCta.label}
            </Link>
          </div>
          <a
            href={copy.nextCohort.href}
            className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline sm:mt-5"
          >
            <span aria-hidden className="size-2 rounded-full bg-asip-mint" />
            {copy.nextCohort.label}
            <ArrowDown
              aria-hidden
              className="size-3.5 transition-transform duration-200 group-hover:translate-y-0.5"
            />
          </a>
        </div>
      </div>

      <HomeHeroSignal />
    </section>
  );
}
