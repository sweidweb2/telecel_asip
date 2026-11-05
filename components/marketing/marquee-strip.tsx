import { Fragment, type CSSProperties } from "react";

import { LOGO_SPECTRUM } from "@/components/marketing/brand-accents";
import { cn } from "@/lib/utils";

/**
 * Slow ticker of words (countries, sectors) between sections (refresh
 * phase 2). The list renders twice for a seamless loop; the copy is hidden
 * from screen readers, which read the list once. Pauses on hover; reduced
 * motion shows a static, wrapped line instead.
 */
export function MarqueeStrip({
  items,
  label,
  className,
  durationSeconds = 60,
}: {
  items: string[];
  /** Accessible name, e.g. "Countries and sectors in the ASIP portfolio". */
  label: string;
  className?: string;
  durationSeconds?: number;
}) {
  if (items.length === 0) return null;

  const row = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-6 pr-6 sm:gap-8 sm:pr-8 motion-reduce:flex-wrap motion-reduce:justify-center"
    >
      {items.map((item, index) => (
        <Fragment key={`${item}-${index}`}>
          <li className="font-heading text-2xl font-semibold tracking-[-0.02em] whitespace-nowrap sm:text-3xl">
            {item}
          </li>
          <li aria-hidden>
            <span
              className={cn(
                "block size-2.5 rotate-45 rounded-[2px]",
                LOGO_SPECTRUM[index % LOGO_SPECTRUM.length],
              )}
            />
          </li>
        </Fragment>
      ))}
    </ul>
  );

  return (
    <section
      aria-label={label}
      className={cn(
        "group/marquee overflow-hidden border-y border-asip-ink/10 bg-background py-5 text-asip-ink sm:py-6",
        className,
      )}
    >
      <div
        className="flex w-max animate-scroll-horizontal group-hover/marquee:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none"
        style={{ "--scroll-duration": `${durationSeconds}s` } as CSSProperties}
      >
        {row(false)}
        <div className="motion-reduce:hidden">{row(true)}</div>
      </div>
    </section>
  );
}
