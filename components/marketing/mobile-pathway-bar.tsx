"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/** Set on <html> while the bar shows, so other fixed controls can sit above it. */
const OFFSET_VAR = "--pathway-bar-offset";
const BAR_OFFSET = "4.75rem";

/**
 * Phone-only Investor | Startup bar (refresh phase 2). Slides in once the
 * hero's pathway buttons scroll away and hides again when the footer
 * arrives, so the two pathways are always one tap away.
 */
export function MobilePathwayBar({
  prompt,
  investor,
  startup,
  watchSelector = "[data-pathway-hero]",
}: {
  prompt: string;
  investor: { href: string; label: string };
  startup: { href: string; label: string };
  /** Element whose disappearance reveals the bar. */
  watchSelector?: string;
}) {
  const [heroGone, setHeroGone] = useState(false);
  const [footerShown, setFooterShown] = useState(false);
  const visible = heroGone && !footerShown;

  useEffect(() => {
    const hero = document.querySelector(watchSelector);
    const footer = document.querySelector("footer");
    const observers: IntersectionObserver[] = [];
    if (hero) {
      const o = new IntersectionObserver(([e]) => setHeroGone(!e?.isIntersecting));
      o.observe(hero);
      observers.push(o);
    }
    if (footer) {
      const o = new IntersectionObserver(([e]) => setFooterShown(!!e?.isIntersecting));
      o.observe(footer);
      observers.push(o);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, [watchSelector]);

  useEffect(() => {
    const root = document.documentElement;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (visible && mobile) root.style.setProperty(OFFSET_VAR, BAR_OFFSET);
    else root.style.removeProperty(OFFSET_VAR);
    return () => {
      root.style.removeProperty(OFFSET_VAR);
    };
  }, [visible]);

  return (
    <div
      role="group"
      aria-label={prompt}
      inert={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-asip-ink/10 bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-300 ease-spring motion-reduce:transition-none md:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="shrink-0 text-xs font-semibold tracking-[0.12em] text-asip-ink/75 uppercase">
          {prompt}
        </span>
        <Link
          href={investor.href}
          className="flex min-h-12 flex-1 items-center justify-center rounded-full border border-asip-ink/25 bg-background px-4 text-sm font-semibold text-asip-ink"
        >
          {investor.label}
        </Link>
        <Link
          href={startup.href}
          className="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-full border-2 border-asip-ink bg-asip-coral px-4 text-sm font-semibold text-white shadow-[2px_2px_0_0_var(--asip-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          {startup.label}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </div>
  );
}
