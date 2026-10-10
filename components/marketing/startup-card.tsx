import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin, TrendingUp } from "lucide-react";

import { StartupBrandedCover } from "@/components/marketing/startup-branded-cover";
import type { Locale } from "@/constants/locales";
import { startupCoverFor } from "@/constants/startup-cover-review";
import { founderStartupPath } from "@/constants/routes";
import { cohortAccent, countryDisplayName } from "@/lib/startup-display";
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
 * Founder directory card — cohort-coloured, with country, sector and a
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

  return (
    <Link
      href={founderStartupPath(locale, startup.slug, fromPage)}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card outline-none transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_18px_40px_-20px_rgb(20_51_59/0.45)] focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-x-0 top-0 z-10 h-1", accent.bar)}
      />
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            style={{ objectPosition: `${startup.image_focal_x}% ${startup.image_focal_y}%` }}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <StartupBrandedCover startup={startup} showMark={!startup.logo_url} />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,rgb(20_51_59/0.55)_0%,transparent_45%)]"
        />
        {startup.cohort ? (
          <span
            className={cn(
              "absolute top-4 left-4 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide shadow-sm",
              accent.chip,
            )}
          >
            {startup.cohort}
          </span>
        ) : null}
        {startup.logo_url ? (
          <div className="absolute bottom-4 left-4 size-14 overflow-hidden rounded-lg border bg-white shadow-sm">
            <Image src={startup.logo_url} alt="" fill className="object-contain p-1.5" sizes="56px" />
          </div>
        ) : null}
        {country ? (
          <span className="absolute right-4 bottom-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-asip-ink shadow-sm backdrop-blur-sm">
            <MapPin aria-hidden className="size-3" />
            {country}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
        {startup.sector ? (
          <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            {startup.sector}
          </p>
        ) : null}
        <h3 className="font-heading text-lg font-semibold leading-snug text-balance sm:text-xl">
          {startup.name}
        </h3>
        {startup.founder_names.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {startup.founder_names.join(", ")}
          </p>
        ) : null}
        {startup.public_outcome ? (
          <p className="mt-1 flex gap-2 rounded-lg bg-brand-subtle px-3 py-2.5 text-sm leading-6 text-foreground">
            <TrendingUp aria-hidden className="mt-1 size-4 shrink-0 text-brand" />
            <span>
              <span className="sr-only">{labels.outcome}: </span>
              {startup.public_outcome}
            </span>
          </p>
        ) : null}
        <p
          className={cn(
            "text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7",
            startup.public_outcome ? "line-clamp-2" : "line-clamp-3",
          )}
        >
          {startup.description}
        </p>
        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-foreground">
          {labels.view}
          <ArrowUpRight
            aria-hidden
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
