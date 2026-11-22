"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const DURATION_MS = 1400;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * Big stat number that counts up once when it scrolls into view
 * (refresh phase 2). Server HTML and reduced-motion users get the final
 * value, so nothing depends on JavaScript to read correctly.
 */
export function CountUpStat({
  value,
  prefix = "",
  suffix = "",
  label,
  underline = "bg-asip-sun",
  className,
  locale = "en",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  /** Colored bar under the number, e.g. "bg-asip-mint". */
  underline?: string;
  className?: string;
  locale?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen at load: leave the final value, no flash to zero.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    setShown(0);
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION_MS);
          setShown(Math.round(value * easeOutCubic(t)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  const format = (n: number) => n.toLocaleString(locale);

  return (
    <div ref={ref} className={cn("flex flex-col", className)}>
      {/* Screen readers get the final figure once, not every frame. */}
      <span className="sr-only">
        {prefix}
        {format(value)}
        {suffix} {label}
      </span>
      <span
        aria-hidden
        className="font-heading text-5xl leading-none font-semibold tracking-[-0.04em] tabular-nums sm:text-6xl"
      >
        {prefix}
        {format(shown)}
        {suffix}
      </span>
      <span aria-hidden className={cn("mt-3 h-1.5 w-12 rounded-full", underline)} />
      <span aria-hidden className="mt-3 text-sm leading-snug font-medium">
        {label}
      </span>
    </div>
  );
}
