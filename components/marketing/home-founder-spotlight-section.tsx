import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

import { StartupBrandedCover } from "@/components/marketing/startup-branded-cover";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { founderStartupPath, publicPath } from "@/constants/routes";
import { startupCoverFor } from "@/constants/startup-cover-review";
import { cohortAccent, countryDisplayName } from "@/lib/startup-display";
import { cn } from "@/lib/utils";
import type { HomePageCopy } from "@/types/marketing-page";
import type {
  StartupCountryReach,
  StartupPublicListItem,
} from "@/types/startup";

const LABELS = {
  en: { markets: "Markets in the portfolio", view: "View profile" },
  fr: { markets: "Marchés du portefeuille", view: "Voir le profil" },
} as const;

/**
 * Mobile: equal portrait cards in a swipe row. sm+: mosaic with one tall
 * feature tile and three supporting tiles.
 */
const TILE_SHAPES = [
  "sm:row-span-2 sm:aspect-auto",
  "sm:aspect-[16/10]",
  "sm:aspect-[16/10]",
  "sm:col-span-2 sm:aspect-[21/8]",
] as const;

type HomeFounderSpotlightSectionProps = {
  locale: Locale;
  copy: HomePageCopy["founders"];
  className?: string;
  countryReach: StartupCountryReach[];
  startups: StartupPublicListItem[];
};

/**
 * Home Module 04 — Spotlight.
 * Real portfolio companies (cover, cohort, country, sector) in a photo mosaic,
 * plus the live list of markets — no map or network schematic.
 */
export function HomeFounderSpotlightSection({
  locale,
  copy,
  className,
  countryReach,
  startups,
}: HomeFounderSpotlightSectionProps) {
  const labels = LABELS[locale];
  const ctaHref = publicPath(locale, copy.cta.slug);
  // Lead with companies that have real photography; branded covers fill gaps.
  const tiles = [
    ...startups.filter((startup) => startupCoverFor(startup)),
    ...startups.filter((startup) => !startupCoverFor(startup)),
  ].slice(0, 4);
  const markets = countryReach
    .map((row) => countryDisplayName(row.countryCode, locale))
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b, locale));

  return (
    <section
      id="founder-spotlight"
      aria-labelledby="home-founder-spotlight-heading"
      className={cn(
        "relative overflow-hidden border-y border-border bg-background",
        "px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
        "[content-visibility:auto] [contain-intrinsic-size:auto_36rem]",
        className,
      )}
    >
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="relative z-10 max-w-xl lg:col-span-5 lg:max-w-none">
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

          {markets.length > 0 ? (
            <div className="mt-7">
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {labels.markets}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                {markets.map((market) => (
                  <li
                    key={market}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-foreground sm:px-3 sm:py-1 sm:text-sm"
                  >
                    <MapPin aria-hidden className="size-3.5 text-brand" />
                    {market}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

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

        {tiles.length > 0 ? (
          <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:col-span-7">
            {tiles.map((startup, index) => {
              const accent = cohortAccent(startup.cohort);
              const country = countryDisplayName(startup.country_code, locale);
              const cover = startupCoverFor(startup);
              return (
                <li
                  key={startup.id}
                  data-reveal="fade"
                  className={cn(
                    "relative aspect-[4/5] w-[78%] min-h-0 shrink-0 snap-start overflow-hidden rounded-xl sm:w-auto",
                    TILE_SHAPES[index % TILE_SHAPES.length],
                  )}
                >
                  <Link
                    href={founderStartupPath(locale, startup.slug)}
                    aria-label={`${startup.name} — ${labels.view}`}
                    className="group absolute inset-0 block outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {cover ? (
                      <Image
                        src={cover}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                        style={{
                          objectPosition: `${startup.image_focal_x}% ${startup.image_focal_y}%`,
                        }}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                      />
                    ) : (
                      <StartupBrandedCover startup={startup} />
                    )}
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-[linear-gradient(to_top,rgb(20_51_59/0.92)_0%,rgb(20_51_59/0.35)_45%,transparent_70%)]"
                    />
                    <span
                      aria-hidden
                      className={cn("absolute inset-x-0 top-0 h-1", accent.bar)}
                    />
                    <span className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] font-semibold tracking-[0.12em] text-white/75 uppercase">
                        {startup.sector ? <span>{startup.sector}</span> : null}
                        {country ? (
                          <span className="inline-flex items-center gap-1 normal-case tracking-normal">
                            <MapPin aria-hidden className="size-3" />
                            {country}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 font-heading text-lg font-semibold sm:text-xl">
                        {startup.name}
                        <ArrowUpRight
                          aria-hidden
                          className="size-4 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed px-6 py-14 text-center text-muted-foreground lg:col-span-7">
            {copy.empty}
          </p>
        )}
      </div>
    </section>
  );
}
