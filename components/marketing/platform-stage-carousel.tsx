"use client";

import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { PLATFORM_STAGE_SLIDES } from "@/constants/platform-stage-slides";
import { cn } from "@/lib/utils";
import type { HomePlatformStepId } from "@/types/marketing-page";

type PlatformStageCarouselProps = {
  activeStepId: HomePlatformStepId;
  onStepSelect: (stepId: HomePlatformStepId) => void;
  className?: string;
};

/**
 * Coverflow carousel driven by the platform spinner.
 * Center slide is focused; neighbors sit overlapped left/right.
 * Prev/next arrows under the stage also sync spinner selection.
 */
export function PlatformStageCarousel({
  activeStepId,
  onStepSelect,
  className,
}: PlatformStageCarouselProps) {
  const activeIndex = Math.max(
    0,
    PLATFORM_STAGE_SLIDES.findIndex((slide) => slide.stepId === activeStepId),
  );
  const count = PLATFORM_STAGE_SLIDES.length;

  function goPrev() {
    const prevIndex = (activeIndex - 1 + count) % count;
    const prev = PLATFORM_STAGE_SLIDES[prevIndex];
    if (prev) onStepSelect(prev.stepId);
  }

  function goNext() {
    const nextIndex = (activeIndex + 1) % count;
    const next = PLATFORM_STAGE_SLIDES[nextIndex];
    if (next) onStepSelect(next.stepId);
  }

  /** Shortest signed distance on a circular strip (so last wraps beside first). */
  function circularOffset(index: number) {
    let offset = index - activeIndex;
    const half = count / 2;
    if (offset > half) offset -= count;
    if (offset < -half) offset += count;
    return offset;
  }

  return (
    <div
      data-testid="platform-stage-carousel"
      data-active-step={activeStepId}
      className={cn("flex h-full w-full flex-col", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Platform stage visuals"
    >
      <div className="relative min-h-0 w-full flex-1 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-10 bg-linear-to-r from-asip-ink to-transparent sm:w-14"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-10 bg-linear-to-l from-asip-ink to-transparent sm:w-14"
        />

        <ul className="absolute inset-0">
          {PLATFORM_STAGE_SLIDES.map((slide, index) => {
            const offset = circularOffset(index);
            const abs = Math.abs(offset);
            const isActive = offset === 0;
            const isVisible = abs <= 2;
            const scale = isActive ? 1 : abs === 1 ? 0.86 : 0.74;

            return (
              <li
                key={slide.stepId}
                className={cn(
                  "absolute top-1/2 left-1/2 h-[92%] w-[min(72%,26rem)]",
                  "transition-[transform,opacity] duration-500 ease-out will-change-transform",
                  !isVisible && "pointer-events-none",
                )}
                style={{
                  transform: `translate(calc(-50% + ${offset * 38}%), -50%) scale(${scale})`,
                  zIndex: isActive ? 30 : 20 - abs,
                  opacity: !isVisible
                    ? 0
                    : isActive
                      ? 1
                      : abs === 1
                        ? 0.55
                        : 0.28,
                }}
              >
                <button
                  type="button"
                  onClick={() => onStepSelect(slide.stepId)}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={slide.alt}
                  className={cn(
                    "relative block size-full overflow-hidden rounded-xl outline-none",
                    "focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-asip-ink",
                    isActive
                      ? "border-[5px] border-white shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--asip-ink)_45%,transparent),0_0_0_1px_color-mix(in_srgb,var(--asip-ink)_8%,transparent)]"
                      : "border border-transparent shadow-[0_10px_24px_-16px_color-mix(in_srgb,var(--asip-ink)_35%,transparent)]",
                  )}
                >
                  <Image
                    src={slide.src}
                    alt=""
                    fill
                    className={cn(
                      "object-cover transition-transform duration-500",
                      isActive ? "scale-100" : "scale-105",
                    )}
                    style={{ objectPosition: slide.position }}
                    sizes="(max-width: 768px) 70vw, 36vw"
                    loading="lazy"
                    fetchPriority="low"
                  />
                  {!isActive ? (
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-asip-ink/25"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous stage"
          className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand hover:text-white"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next stage"
          className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand hover:text-white"
        >
          <ChevronRightIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
