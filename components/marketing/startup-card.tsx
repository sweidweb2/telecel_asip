import Link from "next/link";
import Image from "next/image";

import type { Locale } from "@/constants/locales";
import { founderStartupPath } from "@/constants/routes";
import { startupInitials } from "@/lib/startup-display";
import type { StartupPublicListItem } from "@/types/startup";
import { cn } from "@/lib/utils";

type StartupCardProps = {
  startup: StartupPublicListItem;
  locale: Locale;
  fromPage?: number;
  className?: string;
};

export function StartupCard({
  startup,
  locale,
  fromPage = 1,
  className,
}: StartupCardProps) {
  return (
    <Link
      href={founderStartupPath(locale, startup.slug, fromPage)}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border bg-card outline-none transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
        {startup.cover_image_url ? (
          <Image
            src={startup.cover_image_url}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            style={{ objectPosition: `${startup.image_focal_x}% ${startup.image_focal_y}%` }}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-full items-center justify-center bg-[#14333b]"
          >
            <span className="font-heading text-3xl font-semibold text-white/70 sm:text-4xl">
              {startupInitials(startup.name)}
            </span>
          </div>
        )}
        {startup.logo_url ? <div className="absolute bottom-4 left-4 size-14 overflow-hidden rounded-lg border bg-white shadow-sm"><Image src={startup.logo_url} alt="" fill className="object-contain p-1.5" sizes="56px" /></div> : null}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-5 sm:p-6">
        <div className="flex flex-wrap gap-x-2 text-xs font-semibold uppercase text-primary">
          {startup.cohort ? <span>{startup.cohort}</span> : null}
          {startup.country_code ? <span>{startup.country_code}</span> : null}
          {startup.sector ? <span>{startup.sector}</span> : null}
        </div>
        <h3 className="font-heading text-lg font-semibold leading-snug text-balance group-hover:underline group-hover:underline-offset-4 sm:text-xl">
          {startup.name}
        </h3>
        {startup.founder_names.length > 0 ? <p className="text-sm text-muted-foreground">{startup.founder_names.join(", ")}</p> : null}
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {startup.description}
        </p>
      </div>
    </Link>
  );
}
