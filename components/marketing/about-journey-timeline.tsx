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

      <ol className="about-timeline mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-4 sm:mt-12 md:grid-cols-2 lg:grid-cols-4">
        {timeline.milestones.map((milestone, index) => {
          const isLast = index === lastIndex;

          return (
            <li
              key={milestone.year}
              className={cn(
                "about-timeline__milestone group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:p-6",
                isLast && "border-primary/40 bg-primary/5",
              )}
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-primary/25 transition-colors group-hover:bg-primary" />
              <div className="min-w-0 pt-1">
                <p
                  className={cn(
                    "font-heading text-lg font-semibold tabular-nums tracking-tight sm:text-xl",
                    isLast ? "text-primary" : "text-foreground",
                  )}
                >
                  {milestone.year}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
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
