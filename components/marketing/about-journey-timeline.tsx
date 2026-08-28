import { cn } from "@/lib/utils";
import type { AboutTimelineCopy } from "@/types/marketing-page";

type AboutJourneyTimelineProps = {
  timeline: AboutTimelineCopy;
};

export function AboutJourneyTimeline({ timeline }: AboutJourneyTimelineProps) {
  const lastIndex = timeline.milestones.length - 1;

  return (
    <section id="journey" className="scroll-mt-20">
      <div className="text-center">
        {timeline.eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {timeline.eyebrow}
          </p>
        ) : null}
        <h2 className="font-heading text-2xl font-semibold uppercase tracking-tight text-balance sm:text-3xl">
          {timeline.title}
        </h2>
        <span
          aria-hidden
          className="mx-auto mt-4 block h-1 w-16 rounded-full bg-primary"
        />
      </div>

      <ol className="relative mx-auto mt-10 max-w-3xl sm:mt-12">
        {timeline.milestones.map((milestone, index) => {
          const isLast = index === lastIndex;

          return (
            <li
              key={milestone.year}
              className="relative flex gap-4 pb-8 last:pb-0 sm:gap-5 sm:pb-10"
            >
              <div className="flex w-4 shrink-0 flex-col items-center sm:w-5">
                <span
                  className={cn(
                    "mt-1.5 size-3 shrink-0 rounded-full border-2 sm:mt-2 sm:size-3.5",
                    isLast
                      ? "border-primary bg-primary"
                      : "border-primary bg-background",
                  )}
                  aria-hidden
                />
                {index < lastIndex ? (
                  <span
                    aria-hidden
                    className="mt-1 w-px flex-1 bg-border"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-heading text-lg font-semibold tabular-nums tracking-tight sm:text-xl",
                    isLast ? "text-primary" : "text-foreground",
                  )}
                >
                  {milestone.year}
                </p>
                <p className="mt-2 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  {milestone.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
