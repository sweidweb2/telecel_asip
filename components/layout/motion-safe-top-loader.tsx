"use client";

import { useSyncExternalStore } from "react";
import NextTopLoader from "nextjs-toploader";

const emptySubscribe = () => () => {};

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      media.addEventListener("change", onStoreChange);
      return () => media.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/**
 * Route progress bar that stays instant when the user prefers reduced motion.
 */
export function MotionSafeTopLoader() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <NextTopLoader
      color="var(--brand)"
      height={2}
      showSpinner={false}
      speed={reducedMotion ? 0 : 200}
      crawl={!reducedMotion}
      easing={reducedMotion ? "linear" : "ease"}
    />
  );
}
