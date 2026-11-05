import Image from "next/image";
import { ArrowRight } from "lucide-react";

import "./home-hero.css";

import { HomeHeroContinuum } from "@/components/marketing/home-hero-continuum";
import { HomeHeroSignal } from "@/components/marketing/home-hero-signal";
import {
  LOGO_SPECTRUM,
  renderEmphasis,
} from "@/components/marketing/brand-accents";
import {
  CoralCtaLink,
  coralCtaOnDarkClassName,
  MarketingCtaRow,
  OutlineCtaLink,
} from "@/components/marketing/page-elements";
import { HOME_HERO_CONTINUUM } from "@/constants/home-hero-media";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { IntakeCta } from "@/lib/marketing/intake-cta";
import { cn } from "@/lib/utils";
import type { HomePageCopy } from "@/types/marketing-page";

/** LCP still — 75 is perceptually close at full-bleed and cuts decoder work. */
const HERO_LCP_QUALITY = 75;


type HomeHeroProps = {
  locale: Locale;
  copy: HomePageCopy["hero"];
  pathways: HomePageCopy["pathways"];
  intake: IntakeCta;
};

/**
 * Home Module 01 — Founder Continuum.
 * Upper lockup: spectrum cue → title → fuller description → CTA pair.
 * Next-chapter lives further down the page, not in the hero.
 */
export function HomeHero({ locale, copy, pathways, intake }: HomeHeroProps) {
  const investorHref = publicPath(locale, pathways.investor.slug);
  const continuumLabel = copy.continuumAlts[0] ?? copy.title;
  const lcpSlide = HOME_HERO_CONTINUUM[0]!;
  const lastLine = copy.titleLines.length - 1;

  return (
    <section
      aria-label={continuumLabel}
      className="relative isolate flex min-h-[70svh] items-start overflow-hidden bg-asip-ink text-white sm:min-h-[80svh] md:min-h-[calc(100svh-5.5rem)]"
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
        <div className="absolute inset-0 bg-[linear-gradient(105deg,color-mix(in_srgb,var(--asip-ink)_97%,transparent)_0%,color-mix(in_srgb,var(--asip-ink)_88%,transparent)_36%,color-mix(in_srgb,var(--asip-ink)_45%,transparent)_62%,color-mix(in_srgb,var(--asip-ink)_18%,transparent)_82%,color-mix(in_srgb,var(--asip-ink)_8%,transparent)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--asip-ink)_35%,transparent)_0%,transparent_42%)]" />
      </div>

      <div
        data-hero-copy
        className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-[clamp(4.5rem,14vh,7.5rem)] pb-24 sm:px-6 sm:pb-28 lg:px-8 lg:pb-32"
      >
        <div className="max-w-2xl sm:max-w-3xl">
          <span
            aria-hidden
            className="mb-4 flex h-1.5 w-28 gap-1.5 sm:mb-5 sm:w-36"
          >
            {LOGO_SPECTRUM.map((color, index) => (
              <span
                key={color}
                className={cn(
                  "home-hero-spectrum-seg h-full flex-1 rounded-full",
                  color,
                )}
                style={{ animationDelay: `${350 + index * 110}ms` }}
              />
            ))}
          </span>

          <h1
            aria-label={copy.title}
            className="font-heading text-5xl font-semibold leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl lg:text-[5rem] lg:leading-[0.98]"
          >
            {copy.titleLines.map((line, index) => (
              <span
                key={line}
                aria-hidden
                className={cn(
                  "home-hero-line block",
                  index === lastLine && "home-hero-line--accent",
                )}
                style={{ animationDelay: `${180 + index * 140}ms` }}
              >
                {index === lastLine ? renderEmphasis(line, "underline") : line}
              </span>
            ))}
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-white/75 sm:mt-6 sm:max-w-2xl sm:text-xl sm:leading-9">
            {copy.description}
          </p>

          <div
            role="group"
            aria-labelledby="home-hero-pathways"
            data-pathway-hero
          >
            <p
              id="home-hero-pathways"
              className="mt-9 text-sm font-semibold tracking-[0.14em] text-white/60 uppercase sm:mt-11"
            >
              {pathways.prompt}
            </p>
            <MarketingCtaRow className="mt-3.5 gap-3.5 sm:flex-wrap">
              <OutlineCtaLink
                href={investorHref}
                className="min-h-14 border-white/55 bg-white/5 px-9 text-lg text-white hover:bg-white hover:text-asip-ink sm:px-10"
              >
                {pathways.investor.label}
              </OutlineCtaLink>
              <CoralCtaLink
                href={intake.href}
                className={cn(
                "group min-h-14 px-9 text-lg sm:px-10",
                coralCtaOnDarkClassName,
              )}
              >
                {pathways.startupLabel}
                <ArrowRight
                  aria-hidden
                  className="size-5 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </CoralCtaLink>
            </MarketingCtaRow>
          </div>
        </div>
      </div>

      <HomeHeroSignal />
    </section>
  );
}
