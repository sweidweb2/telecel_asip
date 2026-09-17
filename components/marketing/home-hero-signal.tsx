"use client";

import { useEffect, useState } from "react";

/**
 * Decorative hero signal SVG — deferred until idle so it does not contend with LCP.
 */
export function HomeHeroSignal() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setReady(true);
      return;
    }

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const reveal = () => setReady(true);

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(reveal, { timeout: 1800 });
    } else {
      timeoutId = setTimeout(reveal, 400);
    }

    return () => {
      if (
        idleId !== undefined &&
        typeof window.cancelIdleCallback === "function"
      ) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  if (!ready) return null;

  return (
    <svg
      aria-hidden
      className="home-hero-signal pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-14 w-full text-asip-mint/45 sm:h-36"
      viewBox="0 0 1200 150"
      preserveAspectRatio="none"
    >
      <path
        className="home-hero-signal__line"
        d="M-40 128 C120 108 200 142 340 100 S520 50 680 86 S860 130 1000 92 S1120 60 1240 78"
      />
      <path
        className="home-hero-signal__line home-hero-signal__line--secondary"
        d="M-40 150 C140 120 260 136 400 112 S620 124 800 80 S980 44 1120 58 S1200 70 1240 64"
      />
      {[340, 680, 1000, 1180].map((cx, index) => (
        <circle
          key={cx}
          className="home-hero-signal__node"
          style={{ animationDelay: `${index * 550}ms` }}
          cx={cx}
          cy={index === 0 ? 100 : index === 1 ? 86 : index === 2 ? 92 : 74}
          r="3.5"
        />
      ))}
    </svg>
  );
}
