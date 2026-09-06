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
  "readStory" | "comingSoon"
>;

type ImpactCaseStudyCardProps = {
  locale: Locale;
  copy: CaseStudyCopy;
  story?: ImpactCaseStudyPublic | null;
};

/**
 * Compact Impact case-study card.
 * Pending seats keep the same shell — grey reserved fill, no fake copy.
 * Barrier / connection / outcome narrative lives on the founder story page.
 */
export function ImpactCaseStudyCard({
  locale,
  copy,
  story = null,
}: ImpactCaseStudyCardProps) {
  const isPending = !story || story.status === "pending";
  const name = story?.name?.trim() || "";
  const tags = [story?.sector, story?.country].filter(Boolean) as string[];
  const href =
    !isPending && story?.slug
      ? founderStartupPath(locale, story.slug)
      : null;

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl",
        isPending
          ? "border border-dashed border-muted-foreground/35 bg-muted/50"
          : "border border-border bg-white",
      )}
    >
      <div className="relative aspect-[16/7] w-full shrink-0 bg-muted">
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
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-full items-center justify-center bg-[#14333b]"
          >
            {name ? (
              <span className="font-heading text-2xl font-semibold text-white/70 sm:text-3xl">
                {startupInitials(name)}
              </span>
            ) : null}
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col p-4 sm:p-5",
          isPending && "min-h-28",
        )}
      >
        {tags.length > 0 ? (
          <ul className="mb-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        {name ? (
          <h3 className="font-heading text-base font-semibold tracking-tight text-balance sm:text-lg">
            {name}
          </h3>
        ) : null}

        {story && story.founderNames.length > 0 ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground sm:text-sm">
            {story.founderNames.join(", ")}
          </p>
        ) : null}

        {isPending ? (
          <p
            className={cn(
              "flex flex-1 items-center text-sm font-medium text-muted-foreground",
              name ? "pt-3" : "justify-center text-center",
            )}
          >
            {copy.comingSoon}
          </p>
        ) : (
          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
            {story?.stat ? (
              <span className="inline-flex min-h-8 max-w-[55%] items-center rounded-md bg-muted px-2.5 py-1.5 text-[0.7rem] font-semibold leading-snug tracking-tight text-foreground">
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
        )}
      </div>
    </article>
  );
}
