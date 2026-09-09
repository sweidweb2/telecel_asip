import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  HOME_HERO_CONTINUUM,
  homeHeroContinuumAlt,
} from "@/constants/home-hero-media";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";
import { cn } from "@/lib/utils";
import type { HomePageCopy } from "@/types/marketing-page";

type HomeHeroProps = {
  locale: Locale;
  copy: HomePageCopy["hero"];
  openApplications: boolean;
};

/**
 * Home Module 01 — Founder Continuum.
 * Full-bleed stills soft-crossfade behind a stable brand + headline + CTA lockup.
 * CSS-only loop (RSC); reduced-motion freezes on the first still.
 */
export function HomeHero({ locale, copy, openApplications }: HomeHeroProps) {
  const intake = intakeCtaFor(locale, openApplications);
  const primaryHref = publicPath(locale, copy.primaryCta.slug);
  const continuumLabel = homeHeroContinuumAlt(locale, 0);

  return (
    <section
      aria-label={continuumLabel}
      className="relative isolate flex min-h-[calc(100svh-4.75rem)] items-end overflow-hidden bg-[#14333b] text-white md:min-h-[calc(100svh-5.5rem)]"
    >
      {/* Media plane — continuum loop */}
      <div className="absolute inset-0" aria-hidden>
        {HOME_HERO_CONTINUUM.map((slide, index) => (
          <div
            key={slide.src}
            className={cn("home-hero-continuum-slide absolute inset-0")}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              priority={index === 0}
              fetchPriority={index === 0 ? "high" : "auto"}
              loading={index === 0 ? "eager" : "lazy"}
              className="object-cover"
              style={{ objectPosition: slide.position ?? "center" }}
              sizes="100vw"
              quality={90}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(20,51,59,.97)_0%,rgba(20,51,59,.88)_36%,rgba(20,51,59,.45)_62%,rgba(20,51,59,.18)_82%,rgba(20,51,59,.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,51,59,.55)_0%,transparent_42%)]" />
      </div>

      <div
        data-hero-copy
        className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-12 pb-28 sm:px-6 sm:pt-14 sm:pb-32 lg:px-8 lg:pt-16 lg:pb-36"
      >
        <div>
          <p className="font-heading text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {copy.brand}
          </p>
          <span
            aria-hidden
            className="home-hero-brand-rule mt-3 block h-0.5 w-14 bg-asip-coral sm:mt-4 sm:w-16"
          />
          <p className="mt-4 max-w-xl text-xs font-semibold tracking-[0.16em] text-asip-mint uppercase sm:text-sm">
            {copy.eyebrow}
          </p>
        </div>

        <h1 className="mt-5 max-w-4xl font-heading text-3xl font-semibold leading-[1.08] text-balance sm:mt-6 sm:text-5xl lg:text-6xl">
          {copy.title}
        </h1>

        <p className="mt-5 max-w-xl border-l-2 border-asip-coral pl-4 text-base leading-7 text-white/80 sm:mt-6 sm:pl-5 sm:text-lg sm:leading-8">
          {copy.description}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
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
    </section>
  );
}
