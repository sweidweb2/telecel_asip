"use client";

import { useEffect, useRef } from "react";

type ParsedValue = {
  prefix: string;
  number: number;
  decimals: number;
  grouped: boolean;
  suffix: string;
};

/** "1,200+" → { prefix: "", number: 1200, grouped: true, suffix: "+" }. */
function parseMetricValue(value: string): ParsedValue | null {
  const match = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(value.trim());
  if (!match) return null;
  const [, prefix = "", raw = "", suffix = ""] = match;
  const number = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(number)) return null;
  return {
    prefix,
    number,
    decimals: raw.split(".")[1]?.length ?? 0,
    grouped: raw.includes(","),
    suffix,
  };
}

function formatValue(parsed: ParsedValue, current: number) {
  const fixed = current.toFixed(parsed.decimals);
  const body = parsed.grouped
    ? Number(fixed).toLocaleString("en-US", {
        minimumFractionDigits: parsed.decimals,
        maximumFractionDigits: parsed.decimals,
      })
    : fixed;
  return `${parsed.prefix}${body}${parsed.suffix}`;
}

const DURATION_MS = 1400;

/**
 * Counts a verified metric up once when it scrolls into view.
 * SSR / no-JS / reduced-motion render the final value unchanged; only values
 * that start below the fold animate, so nothing above the fold flashes.
 * Frames write straight to the text node — no React re-render per tick.
 */
export function AnimatedMetricValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    const parsed = parseMetricValue(value);
    if (!node || !parsed || parsed.number === 0) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      typeof window.matchMedia !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let frame = 0;
    node.textContent = formatValue(parsed, 0);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION_MS);
          const eased = 1 - Math.pow(1 - t, 3);
          node.textContent =
            t < 1 ? formatValue(parsed, parsed.number * eased) : value;
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      node.textContent = value;
    };
  }, [value]);

  return <span ref={ref}>{value}</span>;
}
