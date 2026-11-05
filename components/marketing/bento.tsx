import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Mixed-size card grid (refresh phase 2). Replaces evenly ruled tables:
 * one or two cards span wider so the eye has somewhere to land first.
 * Mobile is a single column; spans apply from `md` up.
 */
export function BentoGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid auto-rows-[minmax(11rem,auto)] grid-cols-1 gap-4 md:grid-cols-6 lg:gap-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

type BentoTone = "card" | "mint" | "sun" | "blush" | "ink" | "brand";
type BentoSpan = 2 | 3 | 4 | 6;

const TONES: Record<BentoTone, string> = {
  card: "bg-card text-asip-ink ring-1 ring-asip-ink/10",
  mint: "bg-asip-mint/45 text-asip-ink",
  sun: "bg-asip-sun/70 text-asip-ink",
  blush: "bg-asip-blush/70 text-asip-ink",
  ink: "bg-asip-ink text-white",
  brand: "bg-brand-strong text-white",
};

/** Column span out of six; full width on mobile. */
const SPANS: Record<BentoSpan, string> = {
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  6: "md:col-span-6",
};

export function BentoCard({
  children,
  tone = "card",
  span = 2,
  tall = false,
  className,
}: {
  children: ReactNode;
  tone?: BentoTone;
  span?: BentoSpan;
  /** Spans two rows on desktop, for photo or quote cards. */
  tall?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group/bento relative flex flex-col overflow-hidden rounded-3xl p-6 transition-[translate,box-shadow] duration-300 ease-spring hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_color-mix(in_srgb,var(--asip-ink)_45%,transparent)] motion-reduce:transition-none sm:p-7",
        TONES[tone],
        SPANS[span],
        tall && "md:row-span-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Icon chip used at the top of a bento card. */
export function BentoIcon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "mb-5 inline-flex size-11 items-center justify-center rounded-2xl bg-white/70 text-asip-ink ring-1 ring-asip-ink/10 transition-transform duration-300 ease-spring group-hover/bento:-rotate-6 motion-reduce:transition-none [&_svg]:size-5",
        className,
      )}
    >
      {children}
    </span>
  );
}
