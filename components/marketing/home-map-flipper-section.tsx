"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  HOME_MAP_FLIPPER_SLIDES,
  type MapFlipperSlide,
} from "@/constants/home-map-flipper-dummy";
import { cn } from "@/lib/utils";

const HomeMapCanvas = dynamic(
  () =>
    import("@/components/marketing/home-map-canvas").then(
      (mod) => mod.HomeMapCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-muted/50 sm:aspect-[5/3]"
        aria-hidden
      >
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    ),
  },
);

/**
 * Home prototype — flip between regional maps + dummy stats.
 */
export function HomeMapFlipperSection({ className }: { className?: string }) {
  const slides = HOME_MAP_FLIPPER_SLIDES;
  const [index, setIndex] = useState(0);
  const slide = slides[index] ?? slides[0];
  const canPrev = index > 0;
  const canNext = index < slides.length - 1;

  return (
    <section
      className={cn(
        "border-t border-border bg-background px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0" aria-live="polite">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">
              {slide.eyebrow}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl lg:text-4xl">
              {slide.title}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              {slide.description}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="min-h-11 min-w-11 rounded-full"
              aria-label="Previous map region"
              disabled={!canPrev}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="min-h-11 min-w-11 rounded-full"
              aria-label="Next map region"
              disabled={!canNext}
              onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Demo data only — not verified impact claims.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-8 md:mt-8 md:grid-cols-2 md:items-center md:gap-10 lg:gap-12">
          <HomeMapCanvas slide={slide} />
          <SlideStats slide={slide} />
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground sm:text-left">
          {index + 1} / {slides.length}
        </p>
      </div>
    </section>
  );
}

function SlideStats({ slide }: { slide: MapFlipperSlide }) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-4 md:grid-cols-1 md:gap-6">
      {slide.stats.map((stat) => (
        <li key={stat.label} className="min-w-0 border-t border-border pt-4">
          <p className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {stat.value}
          </p>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {stat.label}
          </p>
        </li>
      ))}
    </ul>
  );
}
