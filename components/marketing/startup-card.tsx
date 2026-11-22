import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin, TrendingUp } from "lucide-react";

import type { Locale } from "@/constants/locales";
import { startupCoverFor } from "@/constants/startup-cover-review";
import { founderStartupPath } from "@/constants/routes";
import {
  cohortAccent,
  countryDisplayName,
  startupInitials,
} from "@/lib/startup-display";
import type { StartupPublicListItem } from "@/types/startup";
import { cn } from "@/lib/utils";

const LABELS = {
  en: { outcome: "Outcome", view: "View profile" },
  fr: { outcome: "Résultat", view: "Voir le profil" },
} as const;

type StartupCardProps = {
  startup: StartupPublicListItem;
  locale: Locale;
  fromPage?: number;
  className?: string;
};

/**
 * Founder directory card — cover/logo image up top, with country, sector and a
 * verified proof point (`public_outcome`) when one is published.
 */
export function StartupCard({
  startup,
  locale,
  fromPage = 1,
  className,
}: StartupCardProps) {
  const labels = LABELS[locale];
  const accent = cohortAccent(startup.cohort);
  const country = countryDisplayName(startup.country_code, locale);
  const cover = startupCoverFor(startup);
  const heroImage = cover ?? startup.logo_url;
  const isLogoHero = !cover && Boolean(startup.logo_url);

  return (
    <Link
      href={founderStartupPath(locale, startup.slug, fromPage)}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card outline-none transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_18px_40px_-20px_rgb(20_51_59/0.45)] focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <div className="relative aspect-[2/1] w-full shrink-0 overflow-hidden bg-white">
        {heroImage ? (
          <Image
            src={heroImage}
            alt=""
            fill
            className={cn(
              "transition-transform duration-500 group-hover:scale-[1.04]",
              isLogoHero ? "object-contain p-4 sm:p-5" : "object-cover",
            )}
            style={
              cover
                ? {
                    objectPosition: `${startup.image_focal_x}% ${startup.image_focal_y}%`,
                  }
                : undefined
            }
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-heading text-2xl font-semibold tracking-tight text-muted-foreground/50 sm:text-3xl">
            {startupInitials(startup.name)}
          </span>
        )}
        {!isLogoHero ? (
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,rgb(20_51_59/0.55)_0%,transparent_45%)]"
          />
        ) : null}
        {startup.cohort ? (
          <span
            className={cn(
              "absolute top-2.5 left-2.5 z-10 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide shadow-sm",
              accent.chip,
            )}
          >
            {startup.cohort}
          </span>
        ) : null}
        {country ? (
          <span className="absolute right-2.5 bottom-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[0.7rem] font-medium text-asip-ink shadow-sm backdrop-blur-sm">
            <MapPin aria-hidden className="size-3" />
            {country}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5 sm:p-4">
        {startup.sector ? (
          <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-primary uppercase">
            {startup.sector}
          </p>
        ) : null}
        <h3 className="font-heading text-sm font-semibold leading-snug text-balance sm:text-base">
          {startup.name}
        </h3>
        {startup.founder_names.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            {startup.founder_names.join(", ")}
          </p>
        ) : null}
        {startup.public_outcome ? (
          <p className="mt-0.5 flex gap-1.5 rounded-md bg-brand-subtle px-2 py-1.5 text-xs leading-5 text-foreground">
            <TrendingUp aria-hidden className="mt-0.5 size-3.5 shrink-0 text-brand" />
            <span>
              <span className="sr-only">{labels.outcome}: </span>
              {startup.public_outcome}
            </span>
          </p>
        ) : null}
        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
          {startup.description}
        </p>
        <span className="mt-auto inline-flex items-center gap-1 pt-1.5 text-xs font-semibold text-foreground">
          {labels.view}
          <ArrowUpRight
            aria-hidden
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
