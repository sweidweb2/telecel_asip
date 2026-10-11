import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ImageIcon, MapPin } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { founderStartupPath, publicPath } from "@/constants/routes";
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

/** Kept off the home mosaic. Still listed in the founders directory. */
const SPOTLIGHT_EXCLUDED_SLUGS = new Set(["munakyalo-agrofresh"]);

/** Programme photos for the mosaic tiles. Not reused on the home page. */
const SPOTLIGHT_TILE_IMAGES = [
  "/asip-media/about-ecosystem.webp",
  "/asip-media/impact-community.webp",
  "/asip-media/alumni-community.webp",
  "/asip-media/founders-working.webp",
] as const;

/** Mobile: swipe cards. sm+: one tall tile beside two stacked tiles. */
const TILE_SHAPES = [
  "sm:row-span-2 sm:aspect-auto",
  "sm:aspect-[4/3]",
  "sm:aspect-[4/3]",
  "sm:col-span-2 sm:aspect-[5/2]",
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
 * Portfolio companies in a short mosaic. Each tile is a programme photo
 * with the company name only. The live market list sits with the copy.
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
  const tiles = startups
    .slice(0, 4)
    .filter((startup) => !SPOTLIGHT_EXCLUDED_SLUGS.has(startup.slug));
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
        "[content-visibility:auto] [contain-intrinsic-size:auto_40rem]",
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
              const photo = SPOTLIGHT_TILE_IMAGES[index];
              return (
                <li
                  key={startup.id}
                  data-reveal="fade"
                  className={cn(
                    "relative aspect-[3/2] w-[72%] min-h-0 shrink-0 snap-start overflow-hidden rounded-xl sm:w-auto",
                    TILE_SHAPES[index % TILE_SHAPES.length],
                  )}
                >
                  <Link
                    href={founderStartupPath(locale, startup.slug)}
                    aria-label={`${startup.name} — ${labels.view}`}
                    className="group absolute inset-0 block outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 flex items-center justify-center bg-[#f3f4ef]"
                    >
                      <ImageIcon className="size-8 text-[#8aa0a4]" strokeWidth={1.5} />
                    </span>
                    {photo ? (
                      <Image
                        src={photo}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 78vw, (max-width: 1024px) 40vw, 28vw"
                      />
                    ) : null}
                    <span
                      aria-hidden
                      className={cn("absolute inset-x-0 top-0 h-1", accent.bar)}
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 via-white/75 to-transparent px-3 pt-8 pb-3 text-foreground sm:px-4 sm:pb-4">
                      <span className="flex items-center gap-1.5 font-heading text-lg font-semibold sm:text-xl">
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
