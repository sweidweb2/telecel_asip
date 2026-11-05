import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { ProgrammePageCopy } from "@/types/marketing-page";

type JourneyStep = ProgrammePageCopy["journey"]["steps"][number];

type ProgrammeJourneySectionProps = {
  copy: ProgrammePageCopy["journey"];
};

const TAPE_COLORS = ["bg-[#e8d48a]/90", "bg-asip-mint/85", "bg-[#f5b7b1]/80"] as const;

const CARD_TILTS = [
  "lg:rotate-[-0.85deg]",
  "lg:rotate-[0.9deg]",
  "lg:rotate-[-0.75deg]",
  "lg:rotate-[0.8deg]",
  "lg:rotate-[-0.9deg]",
  "lg:rotate-[0.7deg]",
] as const;

function padStep(index: number) {
  return String(index + 1).padStart(2, "0");
}

function LinedPaper({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage:
          "repeating-linear-gradient(transparent 0, transparent 27px, rgb(20 51 59 / 0.1) 27px, rgb(20 51 59 / 0.1) 28px)",
        backgroundPosition: "0 12px",
      }}
    />
  );
}

function PageEdge({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-3 hidden w-[7px] lg:block",
        side === "left" ? "left-0" : "right-0",
        side === "left"
          ? "bg-[linear-gradient(90deg,#cbbba8_0%,#f2ebe0_55%,#fffdf6_100%)]"
          : "bg-[linear-gradient(270deg,#cbbba8_0%,#f2ebe0_55%,#fffdf6_100%)]",
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0 w-px bg-asip-ink/12",
          side === "left" ? "right-0" : "left-0",
        )}
      />
    </div>
  );
}

function PathCard({
  step,
  index,
}: {
  step: JourneyStep;
  index: number;
}) {
  return (
    <article
      className={cn(
        "relative rounded-sm border border-asip-ink/10 bg-[#fffef9] p-4 shadow-[2px_3px_0_rgb(20_51_59/0.08)] transition-transform duration-300 sm:p-5 lg:hover:-translate-y-0.5",
        CARD_TILTS[index % CARD_TILTS.length],
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0 left-1/2 z-20 h-3 w-12 -translate-x-1/2 -translate-y-1/2 rounded-[1px] opacity-90 shadow-sm",
          TAPE_COLORS[index % TAPE_COLORS.length],
        )}
      />
      <div className="flex gap-3 sm:gap-4">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-[2px] border border-asip-ink/10 bg-brand-subtle sm:size-14"
          aria-hidden
        >
          <span className="font-heading text-base font-semibold text-brand sm:text-lg">
            {padStep(index)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-base font-semibold tracking-tight text-asip-ink sm:text-lg">
            {step.title}
          </h3>
          <p className="mt-1.5 text-sm leading-6 text-asip-ink/72">
            {step.description}
          </p>
        </div>
      </div>
    </article>
  );
}

function BookPage({
  side,
  title,
  steps,
  stepOffset,
}: {
  side: "left" | "right";
  title?: ReactNode;
  steps: JourneyStep[];
  stepOffset: number;
}) {
  const isLeft = side === "left";

  return (
    <div
      className={cn(
        "relative lg:min-h-[34rem] lg:px-8 lg:py-10 xl:min-h-[38rem] xl:px-10 xl:py-12",
        isLeft
          ? "lg:shadow-[inset_-18px_0_28px_-20px_rgb(20_51_59/0.18)]"
          : "mt-5 lg:mt-0 lg:shadow-[inset_18px_0_28px_-20px_rgb(20_51_59/0.18)]",
      )}
    >
      <LinedPaper className="hidden lg:block" />
      <PageEdge side={side} />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-8 hidden w-px bg-[#f5b7b1]/70 lg:block",
          isLeft ? "left-9 xl:left-11" : "right-9 xl:right-11",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute top-5 hidden h-3.5 rounded-[1px] lg:block",
          isLeft
            ? "left-16 w-16 -rotate-6 bg-asip-mint/55"
            : "left-1/2 w-20 -translate-x-1/2 rotate-1 bg-asip-ink/35",
        )}
      />

      <div className={cn("relative z-10", isLeft ? "lg:pl-4" : "lg:pr-4")}>
        {title ?? <div className="hidden h-10 lg:block xl:h-12" aria-hidden />}

        <ol
          start={stepOffset + 1}
          className={cn("space-y-5", title ? "mt-8" : "lg:mt-2")}
        >
          {steps.map((step, index) => (
            <li key={step.id}>
              <PathCard step={step} index={stepOffset + index} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/**
 * Programme founder journey — open scrapbook spread on lg+, stacked on mobile.
 * Three steps per page (01–03 left, 04–06 right). ASIP parchment / ink / teal.
 * Each step renders once: the spread chrome is CSS-only (lg:*), so the
 * sequence is not duplicated in the DOM for crawlers or assistive tech.
 */
export function ProgrammeJourneySection({
  copy,
}: ProgrammeJourneySectionProps) {
  const leftSteps = copy.steps.slice(0, 3);
  const rightSteps = copy.steps.slice(3, 6);

  return (
    <section
      id="journey"
      aria-labelledby="programme-journey-heading"
      className="border-b border-border bg-background"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="lg:rounded-lg lg:bg-brand-subtle lg:p-1 lg:shadow-[0_18px_40px_-18px_rgb(20_51_59/0.35)] lg:ring-1 lg:ring-asip-ink/10">
          <div className="relative lg:grid lg:grid-cols-2 lg:overflow-hidden lg:rounded-[6px] lg:bg-[#fffef7]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-1/2 z-30 hidden w-20 -translate-x-1/2 lg:block"
              style={{
                background: `linear-gradient(
                  90deg,
                  transparent 0%,
                  rgb(20 51 59 / 0.04) 28%,
                  rgb(20 51 59 / 0.12) 48%,
                  rgb(255 255 255 / 0.55) 50%,
                  rgb(20 51 59 / 0.12) 52%,
                  rgb(20 51 59 / 0.04) 72%,
                  transparent 100%
                )`,
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-6 left-1/2 z-30 hidden w-px -translate-x-1/2 bg-asip-ink/10 lg:block"
            />

            <BookPage
              side="left"
              title={
                <h2
                  id="programme-journey-heading"
                  className="max-w-md font-heading text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl lg:text-asip-ink xl:text-4xl"
                >
                  {copy.title}
                </h2>
              }
              steps={leftSteps}
              stepOffset={0}
            />
            <BookPage side="right" steps={rightSteps} stepOffset={3} />
          </div>
        </div>
      </div>
    </section>
  );
}
