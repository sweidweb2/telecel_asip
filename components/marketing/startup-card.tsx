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
        "group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm outline-none transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
        {startup.logo_url ? (
          <Image
            src={startup.logo_url}
            alt={startup.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-full items-center justify-center bg-gradient-to-br from-primary/15 via-muted to-primary/5"
          >
            <span className="font-heading text-3xl font-semibold tracking-tight text-primary/50 sm:text-4xl">
              {startupInitials(startup.name)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-5 sm:p-6">
        <h3 className="font-heading text-lg font-semibold leading-snug tracking-tight text-balance group-hover:underline group-hover:underline-offset-4 sm:text-xl">
          {startup.name}
        </h3>
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {startup.description}
        </p>
      </div>
    </Link>
  );
}
