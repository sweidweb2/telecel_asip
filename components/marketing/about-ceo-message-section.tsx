import { Quote } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AboutCeoMessageCopy } from "@/types/marketing-page";

type AboutCeoMessageSectionProps = {
  message: AboutCeoMessageCopy;
};

function LeadershipVisual({ label }: { label: string }) {
  return (
    <div
      className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 border-border bg-gradient-to-br from-primary/20 via-muted/70 to-secondary/30 shadow-sm sm:aspect-[4/5]"
      role="img"
      aria-label={label}
    >
      <span
        aria-hidden
        className="about-story-float absolute -right-4 top-8 size-20 rounded-full bg-primary/10 blur-sm"
      />
      <span
        aria-hidden
        className="about-story-float-delayed absolute -left-6 bottom-12 size-24 rounded-full bg-primary/15 blur-sm"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Quote className="size-20 text-primary/30 sm:size-24" aria-hidden />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/10 to-transparent p-4 sm:p-5">
        <p className="text-center text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

/**
 * Leadership message with portrait/video treatment. Renders nothing until
 * Telecel Group supplies approved copy (`published` + paragraphs).
 */
export function AboutCeoMessageSection({
  message,
}: AboutCeoMessageSectionProps) {
  if (!message.published || !message.paragraphs?.length) {
    return null;
  }

  return (
    <section id="leadership" className="scroll-mt-20">
      <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="order-2 min-w-0 lg:order-1">
          <LeadershipVisual label={message.imageLabel} />
        </div>
        <div className="order-1 min-w-0 lg:order-2">
          {message.eyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {message.eyebrow}
            </p>
          ) : null}
          {message.title ? (
            <h2 className="font-heading text-2xl font-semibold uppercase tracking-tight text-balance sm:text-3xl">
              {message.title}
            </h2>
          ) : null}
          <blockquote
            className={cn(
              "flex flex-col gap-5",
              message.title ? "mt-5 sm:mt-6 sm:gap-6" : "mt-0",
            )}
          >
            {message.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
              >
                {paragraph}
              </p>
            ))}
          </blockquote>
          {message.attribution ? (
            <p className="mt-6 text-sm font-medium sm:mt-8">
              {message.attribution}
              {message.role ? (
                <span className="mt-1 block font-normal text-muted-foreground">
                  {message.role}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
