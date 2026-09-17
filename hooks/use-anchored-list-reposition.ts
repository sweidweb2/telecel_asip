"use client";

import { useEffect } from "react";

/**
 * While an anchored listbox is open, keep it aligned on resize / nested scroll.
 * Coalesces to one {@link requestAnimationFrame} so capture-phase scroll does
 * not call getBoundingClientRect on every event (P2.5).
 */
export function useAnchoredListReposition(
  enabled: boolean,
  update: () => void,
) {
  useEffect(() => {
    if (!enabled) return;

    let rafId = 0;

    function onReposition() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        update();
      });
    }

    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [enabled, update]);
}
