import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/constants/locales";
import { founderStartupPath } from "@/constants/routes";
import { startupInitials } from "@/lib/startup-display";
import { cn } from "@/lib/utils";
import type { ImpactCaseStudyPublic } from "@/types/founder-story";
import type { ImpactPageCopy } from "@/types/marketing-page";

type CaseStudyCopy = Pick<
  ImpactPageCopy["caseStudy"],
  "readStory" | "steps" | "comingSoon"
>;

type ImpactCaseStudyCardProps = {
  locale: Locale;
  copy: CaseStudyCopy;
  story?: ImpactCaseStudyPublic | null;
};

type TimelineStep = {
  id: "barrier" | "support" | "outcome";
  label: string;
  text: string | null;
};

/**
 * Repeatable Impact case-study card.
 * Pending seats keep the same shell — grey reserved fill, no fake copy.
 */
export function ImpactCaseStudyCard({
  locale,
  copy,
  story = null,
}: ImpactCaseStudyCardProps) {
  const isPending = !story || story.status === "pending";
  const name = story?.name?.trim() || "";
  const tags = [story?.sector, story?.country].filter(Boolean) as string[];
  const steps: TimelineStep[] = [
    { id: "barrier", label: copy.steps.barrier, text: story?.barrier ?? null },
    { id: "support", label: copy.steps.support, text: story?.support ?? null },
    { id: "outcome", label: copy.steps.outcome, text: story?.outcome ?? null },
  ].filter((step) => Boolean(step.text));
  const href =
    !isPending && story?.slug
      ? founderStartupPath(locale, story.slug)
      : null;

  return (
    <article
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-xl md:flex-row",
        isPending
          ? "border border-dashed border-muted-foreground/35 bg-muted/50"
          : "border border-border bg-white",
      )}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 bg-muted md:aspect-auto md:min-h-[14rem] md:w-[40%]">
        {isPending ? (
          <div className="size-full bg-muted" aria-hidden />
        ) : story?.coverImageUrl ? (
          <Image
            src={story.coverImageUrl}
            alt=""
            fill
            className="object-cover"
            style={{
              objectPosition: `${story.imageFocalX}% ${story.imageFocalY}%`,
            }}
            sizes="(max-width: 768px) 90vw, (max-width: 1280px) 28vw, 18vw"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-full items-center justify-center bg-[#14333b]"
          >
            {name ? (
              <span className="font-heading text-3xl font-semibold text-white/70 sm:text-4xl">
                {startupInitials(name)}
              </span>
            ) : null}
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col p-5 sm:p-6 md:w-[60%]",
          isPending && "min-h-36 md:min-h-0",
        )}
      >
        {tags.length > 0 ? (
          <ul className="mb-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        {name ? (
          <h3 className="font-heading text-lg font-semibold tracking-tight text-balance sm:text-xl">
            {name}
          </h3>
        ) : null}

        {story && story.founderNames.length > 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {story.founderNames.join(", ")}
          </p>
        ) : null}

        {isPending ? (
          <p
            className={cn(
              "flex flex-1 items-center text-sm font-medium text-muted-foreground sm:text-base",
              name ? "pt-4" : "justify-center text-center",
            )}
          >
            {copy.comingSoon}
          </p>
        ) : (
          <>
            {steps.length > 0 ? (
              <ol className="mt-5 space-y-3">
                {steps.map((step) => (
                  <li key={step.id} className="flex gap-3">
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        step.id === "support"
                          ? "bg-muted-foreground/50"
                          : "bg-[#dc395f]",
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {step.label}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 line-clamp-2 text-sm leading-6 sm:text-[0.95rem] sm:leading-7",
                          step.id === "support"
                            ? "text-muted-foreground"
                            : "text-foreground",
                        )}
                      >
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : null}

            <div className="mt-auto flex items-end justify-between gap-3 pt-5">
              {story?.stat ? (
                <span className="inline-flex min-h-8 max-w-[60%] items-center rounded-md bg-muted px-2.5 text-xs font-semibold tracking-tight text-foreground">
                  {story.stat}
                </span>
              ) : (
                <span />
              )}

              {href ? (
                <Link
                  href={href}
                  className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-[#dc395f] underline-offset-4 hover:underline"
                >
                  {copy.readStory}
                </Link>
              ) : null}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
