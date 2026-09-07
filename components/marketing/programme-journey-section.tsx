import { cn } from "@/lib/utils";
import type { ProgrammePageCopy } from "@/types/marketing-page";

type JourneyStep = ProgrammePageCopy["journey"]["steps"][number];

type ProgrammeJourneySectionProps = {
  copy: ProgrammePageCopy["journey"];
};

const TAPE_COLORS = ["bg-[#e8d48a]/90", "bg-[#9ad1bf]/85", "bg-[#f5b7b1]/80"] as const;

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
        "pointer-events-none absolute inset-y-3 w-[7px]",
        side === "left" ? "left-0" : "right-0",
        side === "left"
          ? "bg-[linear-gradient(90deg,#cbbba8_0%,#f2ebe0_55%,#fffdf6_100%)]"
          : "bg-[linear-gradient(270deg,#cbbba8_0%,#f2ebe0_55%,#fffdf6_100%)]",
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0 w-px bg-[#14333b]/12",
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
        "relative rounded-sm border border-[#14333b]/10 bg-[#fffef9] p-4 shadow-[2px_3px_0_rgb(20_51_59/0.08)] sm:p-5",
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
          className="flex size-12 shrink-0 items-center justify-center rounded-[2px] border border-[#14333b]/10 bg-[#f2f5ef] sm:size-14"
          aria-hidden
        >
          <span className="font-heading text-base font-semibold text-[#179191] sm:text-lg">
            {padStep(index)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-[#179191] uppercase">
            {padStep(index)}
          </p>
          <h3 className="mt-1 font-heading text-base font-semibold tracking-tight text-[#14333b] sm:text-lg">
            {step.title}
          </h3>
          <p className="mt-1.5 text-sm leading-6 text-[#14333b]/72">
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
  title?: string;
  steps: JourneyStep[];
  stepOffset: number;
}) {
  const isLeft = side === "left";

  return (
    <div
      className={cn(
        "relative min-h-[34rem] px-8 py-10 xl:min-h-[38rem] xl:px-10 xl:py-12",
        isLeft
          ? "shadow-[inset_-18px_0_28px_-20px_rgb(20_51_59/0.18)]"
          : "shadow-[inset_18px_0_28px_-20px_rgb(20_51_59/0.18)]",
      )}
    >
      <LinedPaper />
      <PageEdge side={side} />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-8 w-px bg-[#f5b7b1]/70",
          isLeft ? "left-9 xl:left-11" : "right-9 xl:right-11",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute top-5 h-3.5 rounded-[1px]",
          isLeft
            ? "left-16 w-16 -rotate-6 bg-[#9ad1bf]/55"
            : "left-1/2 w-20 -translate-x-1/2 rotate-1 bg-[#14333b]/35",
        )}
      />

      <div className={cn("relative z-10", isLeft ? "pl-4" : "pr-4")}>
        {title ? (
          <p
            aria-hidden
            className="max-w-md font-heading text-3xl font-semibold tracking-tight text-balance text-[#14333b] xl:text-4xl"
          >
            {title}
          </p>
        ) : (
          <div className="h-10 xl:h-12" aria-hidden />
        )}

        <div className={cn("space-y-5", title ? "mt-8" : "mt-2")}>
          {steps.map((step, index) => (
            <PathCard
              key={step.id}
              step={step}
              index={stepOffset + index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Programme founder journey — open scrapbook spread on lg+, stacked on mobile.
 * Three steps per page (01–03 left, 04–06 right). ASIP parchment / ink / teal.
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
        <h2
          id="programme-journey-heading"
          className="font-heading text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl lg:sr-only"
        >
          {copy.title}
        </h2>

        <div className="mt-8 lg:hidden">
          <ol className="space-y-5">
            {copy.steps.map((step, index) => (
              <li key={step.id}>
                <article className="rounded-sm border border-border bg-[#fffef9] p-4 shadow-sm sm:p-5">
                  <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-primary uppercase">
                    {padStep(index)}
                  </p>
                  <h3 className="mt-1 font-heading text-base font-semibold tracking-tight sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </article>
              </li>
            ))}
          </ol>
        </div>

        <div className="hidden lg:block">
          <div
            className={cn(
              "rounded-lg bg-[#f2f5ef] p-1 shadow-[0_18px_40px_-18px_rgb(20_51_59/0.35)]",
              "ring-1 ring-[#14333b]/10",
            )}
          >
            <div className="relative grid grid-cols-2 overflow-hidden rounded-[6px] bg-[#fffef7]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-1/2 z-30 w-20 -translate-x-1/2"
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
                className="pointer-events-none absolute inset-y-6 left-1/2 z-30 w-px -translate-x-1/2 bg-[#14333b]/10"
              />

              <BookPage
                side="left"
                title={copy.title}
                steps={leftSteps}
                stepOffset={0}
              />
              <BookPage side="right" steps={rightSteps} stepOffset={3} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
