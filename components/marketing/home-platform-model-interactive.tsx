"use client";

import { useMemo, useState } from "react";

import { PlatformStageCarousel } from "@/components/marketing/platform-stage-carousel";
import { cn } from "@/lib/utils";
import type { HomePageCopy, HomePlatformStepId } from "@/types/marketing-page";

/**
 * Compact radial dial for the five platform steps.
 * Active step sits in the hub; options orbit on a ring (spinner).
 */
function StepSpinner({
  steps,
  activeStepId,
  onSelect,
}: {
  steps: HomePageCopy["platform"]["steps"];
  activeStepId: HomePlatformStepId;
  onSelect: (id: HomePlatformStepId) => void;
}) {
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeStepId),
  );
  const active = steps[activeIndex] ?? steps[0];
  const count = steps.length;
  const orbitRem = 6.6;

  const r = 38;
  const stepDeg = count > 0 ? 360 / count : 0;
  const gapDeg = 16;
  const round = (n: number) => Number(n.toFixed(3));

  const polar = (deg: number, radius = r) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: round(50 + Math.cos(rad) * radius),
      y: round(50 + Math.sin(rad) * radius),
    };
  };

  const arcPath = (fromDeg: number, toDeg: number) => {
    const start = polar(fromDeg);
    const end = polar(toDeg);
    const sweep = (toDeg - fromDeg + 360) % 360;
    if (sweep < 1) return null;
    const largeArc = sweep > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  const connectorPaths = Array.from(
    { length: Math.max(0, activeIndex) },
    (_, i) => arcPath(i * stepDeg + gapDeg, (i + 1) * stepDeg - gapDeg),
  ).filter(Boolean) as string[];

  const trackPaths = Array.from({ length: count }, (_, i) =>
    arcPath(i * stepDeg + gapDeg, (i + 1) * stepDeg - gapDeg),
  ).filter(Boolean) as string[];

  return (
    <div
      className="relative mx-auto size-[17.5rem] shrink-0 sm:size-[19rem]"
      role="group"
      aria-label="Platform stages"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklab,white_16%,transparent),transparent_70%)]"
      />

      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full -rotate-90"
      >
        {trackPaths.map((d, index) => (
          <path
            key={`track-${index}`}
            d={d}
            fill="none"
            stroke="color-mix(in oklab, white 22%, transparent)"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        ))}
        {connectorPaths.map((d, index) => (
          <path
            key={`link-${index}`}
            d={d}
            fill="none"
            stroke="color-mix(in oklab, white 85%, transparent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="transition-[opacity,stroke] duration-500 ease-out"
          />
        ))}
      </svg>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-[4%] animate-[spin_28s_linear_infinite] rounded-full border border-dashed border-white/35"
      />

      <div className="absolute inset-[28%] z-10 overflow-hidden rounded-full bg-white shadow-[0_0_0_1px_color-mix(in_oklab,white_20%,transparent),0_12px_28px_-16px_rgba(0,0,0,0.35)]">
        <div className="flex size-full flex-col items-center justify-center px-3 text-center">
          <p className="font-mono text-[0.6rem] tracking-[0.18em] text-brand uppercase">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(count).padStart(2, "0")}
          </p>
          <p className="mt-1 w-full truncate px-1 font-heading text-sm font-semibold leading-tight text-[#14333b] sm:text-[0.95rem]">
            {active?.title}
          </p>
        </div>
      </div>

      <ul className="absolute inset-0 z-20" role="list">
        {steps.map((step, index) => {
          const angle = (360 / count) * index - 90;
          const isActive = step.id === activeStepId;
          const isReached = index <= activeIndex;
          return (
            <li
              key={step.id}
              className="absolute top-1/2 left-1/2"
              style={{
                transform: `rotate(${angle}deg) translate(${orbitRem}rem) rotate(${-angle}deg)`,
              }}
            >
              <button
                type="button"
                onClick={() => onSelect(step.id)}
                aria-pressed={isActive}
                aria-label={`${String(index + 1).padStart(2, "0")} ${step.title}`}
                title={step.title}
                className={cn(
                  "flex size-12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                  isReached
                    ? isActive
                      ? "scale-110 bg-white text-[#14333b] shadow-[0_0_0_6px_color-mix(in_oklab,white_22%,transparent)]"
                      : "bg-white text-[#14333b] shadow-[0_0_0_1px_color-mix(in_oklab,white_20%,transparent)] hover:scale-105"
                    : "bg-[#14333b] text-white shadow-[0_0_0_1px_color-mix(in_oklab,white_35%,transparent)] hover:scale-105 hover:shadow-[0_0_0_4px_color-mix(in_oklab,white_14%,transparent)]",
                )}
              >
                <span className="leading-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type HomePlatformModelInteractiveProps = {
  steps: HomePageCopy["platform"]["steps"];
};

/**
 * Client island: shared active step between spinner and stage carousel.
 */
export function HomePlatformModelInteractive({
  steps,
}: HomePlatformModelInteractiveProps) {
  const firstStepId = steps[0]?.id ?? "discover";
  const [activeStepId, setActiveStepId] =
    useState<HomePlatformStepId>(firstStepId);

  const activeStep = useMemo(
    () => steps.find((step) => step.id === activeStepId) ?? steps[0],
    [activeStepId, steps],
  );

  return (
    <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
      <div className="flex min-h-[17rem] items-center justify-center sm:min-h-[19rem] lg:col-span-4 lg:min-h-[22rem]">
        <StepSpinner
          steps={steps}
          activeStepId={activeStepId}
          onSelect={setActiveStepId}
        />
        {activeStep ? (
          <p className="sr-only">{activeStep.description}</p>
        ) : null}
      </div>

      <div className="relative flex h-[17.5rem] w-full flex-col bg-transparent sm:h-[19.5rem] lg:col-span-8 lg:h-[22.5rem]">
        <PlatformStageCarousel
          activeStepId={activeStepId}
          onStepSelect={setActiveStepId}
        />
      </div>
    </div>
  );
}
