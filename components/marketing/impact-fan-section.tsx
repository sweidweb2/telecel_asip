import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CircleDollarSign,
  Settings2,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  impactFanCopyFor,
  type ImpactFanBadgeId,
  type ImpactFanImage,
} from "@/constants/impact-fan-copy";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { cn } from "@/lib/utils";

const BADGE_ICONS: Record<ImpactFanBadgeId, LucideIcon> = {
  revenue: CircleDollarSign,
  mentors: Users,
  operations: Settings2,
  partners: Building2,
  growth: TrendingUp,
};

type ImpactFanSectionProps = {
  locale: Locale;
  className?: string;
};

/** Fan placement — outer cards rotate more; centre lifts and slightly overlaps its neighbours. */
const FAN_SLOTS = [
  {
    className:
      "left-0 z-[14] w-[28%] -rotate-[11deg] sm:w-[24%] sm:-rotate-[10deg] lg:w-[22%]",
    floatClassName: "about-story-float",
    badgeSide: "left" as const,
  },
  {
    className:
      "left-[15%] z-[16] w-[28%] -translate-y-2 -rotate-[5deg] sm:left-[17%] sm:w-[24%] sm:-translate-y-3 sm:-rotate-[4deg] lg:left-[17%] lg:w-[24%]",
    floatClassName: "next-chapter-float-delayed",
    badgeSide: "left" as const,
  },
  {
    className:
      "left-1/2 z-[18] w-[30%] -translate-x-1/2 -translate-y-5 sm:w-[26%] sm:-translate-y-7 lg:w-[26%] lg:-translate-y-8",
    floatClassName: "about-story-float-delayed",
    badgeSide: "left" as const,
  },
  {
    className:
      "right-[15%] z-[16] w-[28%] -translate-y-2 rotate-[5deg] sm:right-[17%] sm:w-[24%] sm:-translate-y-3 sm:rotate-[4deg] lg:right-[17%] lg:w-[24%]",
    floatClassName: "next-chapter-float",
    badgeSide: "right" as const,
  },
  {
    className:
      "right-0 z-[14] w-[28%] rotate-[11deg] sm:w-[24%] sm:rotate-[10deg] lg:w-[22%]",
    floatClassName: "about-story-float",
    badgeSide: "right" as const,
  },
] as const;

/**
 * Impact page — centred eyebrow / title, fanned image cards, three-stat row, CTA.
 */
export function ImpactFanSection({
  locale,
  className,
}: ImpactFanSectionProps) {
  const copy = impactFanCopyFor(locale);
  const ctaHref = publicPath(locale, copy.cta.slug);

  return (
    <section
      id="traction"
      aria-labelledby="impact-fan-heading"
      className={cn(
        "border-t border-border bg-background px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            <span
              aria-hidden
              className="size-1.5 shrink-0 rounded-full bg-foreground"
            />
            {copy.eyebrow}
          </p>

          <h2
            id="impact-fan-heading"
            className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl"
          >
            {copy.titleLead}{" "}
            <span className="font-serif font-normal italic text-muted-foreground">
              {copy.titleAccent}
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-8">
            {copy.description}
          </p>
        </div>

        {/* Fanned image cards — bottom-aligned so no dead space above the stats */}
        <div className="relative mx-auto mt-14 h-[12rem] w-full max-w-xl sm:mt-16 sm:h-[15.5rem] sm:max-w-3xl lg:mt-24 lg:h-[17.5rem] lg:max-w-4xl">
          {copy.images.map((image, index) => {
            const slot = FAN_SLOTS[index];
            if (!slot) return null;

            return (
              <FanCard
                key={image.src}
                image={image}
                className={slot.className}
                floatClassName={slot.floatClassName}
                badgeSide={slot.badgeSide}
              />
            );
          })}
        </div>

        {/* Stats */}
        <ul className="mt-5 grid grid-cols-1 divide-y divide-border border-y border-border sm:mt-7 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:mt-10">
          {copy.stats.map((stat) => (
            <li
              key={stat.id}
              className="flex flex-col px-1 py-8 text-center sm:px-6 sm:py-10 lg:px-8"
            >
              <p className="font-heading text-4xl font-semibold tracking-tight text-foreground metric-numeral sm:text-5xl">
                {stat.value}
              </p>
              <h3 className="mt-3 font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {stat.titleLead}{" "}
                <span className="font-serif font-normal italic text-muted-foreground">
                  {stat.titleAccent}
                </span>
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:mt-2.5 sm:leading-7">
                {stat.description}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex justify-center sm:mt-10">
          <Link
            href={ctaHref}
            className={cn(
              "inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 sm:w-auto sm:px-7",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          >
            {copy.cta.label}
            <span
              aria-hidden
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-foreground"
            >
              <ArrowUpRight className="size-4" strokeWidth={2.25} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function FanCard({
  image,
  className,
  floatClassName,
  badgeSide = "left",
}: {
  image: ImpactFanImage;
  className?: string;
  floatClassName?: string;
  badgeSide?: "left" | "right";
}) {
  const Icon = BADGE_ICONS[image.id];

  return (
    <figure
      className={cn(
        "absolute bottom-0 aspect-[3/4] hover:z-30",
        className,
        floatClassName,
      )}
    >
      <div
        className={cn(
          "relative size-full rounded-2xl bg-white p-1 shadow-[0_18px_40px_-24px_color-mix(in_srgb,var(--asip-ink)_45%,transparent)] ring-1 ring-foreground/8 sm:rounded-3xl sm:p-1.5",
          "origin-center transition-transform duration-300 ease-out will-change-transform hover:scale-105",
        )}
      >
        <div className="relative size-full overflow-hidden rounded-[calc(1rem-2px)] sm:rounded-[calc(1.5rem-3px)]">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 40vw, (max-width: 1024px) 28vw, 320px"
            quality={75}
          />
          <figcaption
            aria-label={image.badge}
            className={cn(
              "absolute top-2 inline-flex items-center rounded-full bg-background/95 shadow-sm backdrop-blur-sm",
              /* Mobile: icon-only chip — text labels need more room from sm */
              "size-7 justify-center sm:top-3 sm:h-auto sm:w-auto sm:max-w-[calc(100%-1.5rem)] sm:gap-1.5 sm:px-3 sm:py-1.5",
              badgeSide === "right"
                ? "right-2 sm:right-3"
                : "left-2 sm:left-3",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "inline-flex size-5 items-center justify-center rounded-full text-white sm:size-4",
                image.dotClassName,
              )}
            >
              <Icon className="size-3 sm:size-2.5" strokeWidth={2.5} />
            </span>
            <span className="hidden truncate text-xs font-semibold tracking-[0.12em] text-foreground uppercase sm:inline">
              {image.badge}
            </span>
          </figcaption>
        </div>
      </div>
    </figure>
  );
}
