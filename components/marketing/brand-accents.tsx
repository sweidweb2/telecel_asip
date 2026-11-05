import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Logo ring order (clockwise from the top-left): magenta → green → red → sky → sun.
 * Every spectrum mark on the public site uses this order.
 */
export const LOGO_SPECTRUM = [
  "bg-asip-magenta",
  "bg-brand-mid",
  "bg-asip-coral",
  "bg-asip-sky",
  "bg-asip-sun",
] as const;

type EmphTone = "marker" | "underline";

/**
 * Sun-yellow emphasis on one word of a headline.
 * `marker` sits behind ink text on light surfaces; `underline` is a thick
 * bar under light text on dark surfaces (white on sun would fail contrast).
 */
export function Emph({
  children,
  tone = "marker",
  className,
}: {
  children: ReactNode;
  tone?: EmphTone;
  className?: string;
}) {
  return (
    <span className={cn("asip-emph", `asip-emph--${tone}`, className)}>
      {children}
    </span>
  );
}

/**
 * Renders copy with `[word]` markers as `<Emph>`. Copy without markers is
 * returned as-is, so approved strings only gain brackets, never new words.
 */
export function renderEmphasis(text: string, tone: EmphTone = "marker"): ReactNode {
  const parts = text.split(/\[([^\]]+)\]/);
  if (parts.length === 1) return text;
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <Emph key={index} tone={tone}>
        {part}
      </Emph>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

/** Strips `[word]` markers for aria-labels, metadata and plain-text use. */
export function stripEmphasis(text: string): string {
  return text.replace(/\[([^\]]+)\]/g, "$1");
}

type StickerTone = "mint" | "sun" | "blush" | "ink" | "outline";

const STICKER_TONES: Record<StickerTone, string> = {
  mint: "bg-asip-mint text-asip-ink",
  sun: "bg-asip-sun text-asip-ink",
  blush: "bg-asip-blush text-asip-ink",
  ink: "bg-asip-ink text-white",
  outline: "border border-dashed border-asip-ink/30 text-asip-ink/75",
};

/** Small rounded tag. `tilt` adds the slight rotation used on section openers. */
export function Sticker({
  children,
  tone = "mint",
  tilt = false,
  className,
}: {
  children: ReactNode;
  tone?: StickerTone;
  tilt?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-heading text-xs font-semibold tracking-tight sm:text-sm",
        STICKER_TONES[tone],
        tilt && "-rotate-2",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Thin five-colour rule in logo order. `draw` animates it in on scroll. */
export function SpectrumLine({
  className,
  draw = false,
}: {
  className?: string;
  draw?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn("grid h-1 grid-cols-5", draw && "asip-spectrum-draw", className)}
    >
      {LOGO_SPECTRUM.map((color) => (
        <span key={color} className={color} />
      ))}
    </div>
  );
}
