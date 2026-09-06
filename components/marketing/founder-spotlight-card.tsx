import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/constants/locales";
import { founderStartupPath } from "@/constants/routes";
import { startupInitials } from "@/lib/startup-display";
import { cn } from "@/lib/utils";
import type { StartupPublicListItem } from "@/types/startup";

type FounderSpotlightCardProps = {
  locale: Locale;
  startup: StartupPublicListItem;
  /** Zero-based index — drives the CAD plate coordinate label. */
  index: number;
  className?: string;
};

/** Blueprint plate id: A1, B1, C1, A2, B2… */
function plateCoord(index: number): string {
  const col = String.fromCharCode(65 + (index % 3));
  const row = Math.floor(index / 3) + 1;
  return `${col}${row}`;
}

/**
 * Home Founder Spotlight plate — story-first, CAD/hairline frame.
 * Logo is a secondary corner mark only; cover / monogram carries the visual.
 */
export function FounderSpotlightCard({
  locale,
  startup,
  index,
  className,
}: FounderSpotlightCardProps) {
  const href = founderStartupPath(locale, startup.slug);
  const story = (startup.public_outcome ?? startup.description).trim();
  const tags = [startup.cohort, startup.country_code, startup.sector].filter(
    Boolean,
  ) as string[];
  const coord = plateCoord(index);

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full flex-col bg-background outline-none",
        "border border-[#14333b]/18",
        "transition-colors hover:border-brand focus-visible:border-brand",
        "focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfaf6]",
        className,
      )}
    >
      {/* Media elevation */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden border-b border-[#14333b]/18 bg-[#14333b]">
        {startup.cover_image_url ? (
          <Image
            src={startup.cover_image_url}
            alt=""
            fill
            className="object-cover opacity-95 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              objectPosition: `${startup.image_focal_x}% ${startup.image_focal_y}%`,
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-full items-center justify-center bg-[#14333b]"
          >
            <span className="font-heading text-3xl font-semibold tracking-tight text-white/70 sm:text-4xl">
              {startupInitials(startup.name)}
            </span>
          </div>
        )}

        {/* CAD chrome overlay */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Corner ticks */}
          <span className="absolute top-2 left-2 size-3 border-t border-l border-white/80" />
          <span className="absolute top-2 right-2 size-3 border-t border-r border-white/80" />
          <span className="absolute bottom-2 left-2 size-3 border-b border-l border-white/80" />
          <span className="absolute right-2 bottom-2 size-3 border-r border-b border-white/80" />
          {/* Center crosshair */}
          <span className="absolute top-1/2 left-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-white/55" />
          <span className="absolute top-1/2 left-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-white/55" />
          <span className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" />
          {/* Dimension ticks along bottom edge */}
          <span className="absolute inset-x-6 bottom-1.5 flex justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "w-px bg-white/50",
                  i === 0 || i === 6 ? "h-2" : "h-1",
                )}
              />
            ))}
          </span>
          {/* Plate coordinate */}
          <span className="absolute top-2.5 left-1/2 -translate-x-1/2 bg-[#14333b]/55 px-1.5 py-0.5 font-mono text-[0.65rem] tracking-[0.18em] text-white/90 uppercase">
            {coord}
          </span>
        </div>

        {startup.logo_url ? (
          <div className="absolute right-3 bottom-3 size-11 overflow-hidden border border-[#14333b]/25 bg-background">
            <Image
              src={startup.logo_url}
              alt=""
              fill
              className="object-contain p-1"
              sizes="44px"
            />
          </div>
        ) : null}
      </div>

      {/* Spec sheet */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
        {tags.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="inline-flex items-center border border-[#14333b]/20 bg-transparent px-2 py-0.5 font-mono text-[0.65rem] font-medium tracking-[0.14em] text-[#14333b]/70 uppercase"
              >
                <span
                  aria-hidden
                  className="mr-1.5 size-1.5 shrink-0 bg-brand"
                />
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="min-w-0 space-y-1">
          <h3 className="font-heading text-lg font-semibold tracking-tight text-balance text-[#14333b] group-hover:text-brand sm:text-xl">
            {startup.name}
          </h3>
          {startup.founder_names.length > 0 ? (
            <p className="text-sm text-[#14333b]/65">
              {startup.founder_names.join(", ")}
            </p>
          ) : null}
        </div>

        {story ? (
          <p className="mt-auto line-clamp-3 text-sm leading-6 text-[#14333b]/72 sm:text-base sm:leading-7">
            {story}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
