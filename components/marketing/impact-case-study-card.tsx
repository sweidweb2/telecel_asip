import Image from "next/image";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

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
 * Barrier / ASIP support / outcome narrative lives on the founder story page.
 */
export function ImpactCaseStudyCard({
  locale,
  copy,
  story = null,
}: ImpactCaseStudyCardProps) {
  const isPending = !story || story.status === "pending";
  const name = story?.name?.trim() || "";
  const title = story?.title?.trim() || "";
  const tags = [story?.sector, story?.country].filter(Boolean) as string[];
  const href =
    !isPending && story?.slug
      ? founderStartupPath(locale, story.slug)
      : null;

  const card = (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl",
        isPending
          ? "border border-dashed border-muted-foreground/35 bg-muted/50"
          : "border border-border bg-white transition-[transform,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_-20px_rgb(20_51_59/0.45)]",
      )}
    >
      <div
        className={cn(
          "relative aspect-[16/9] w-full shrink-0 overflow-hidden",
          isPending
            ? "bg-muted"
            : story?.coverImageUrl
              ? "bg-white"
              : "bg-asip-ink",
        )}
      >
        {isPending ? (
          <div className="size-full bg-muted" aria-hidden />
        ) : story?.coverImageUrl ? (
          <Image
            src={story.coverImageUrl}
            alt=""
            fill
            className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.03] sm:p-6"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-full items-center justify-center bg-asip-ink"
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
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-asip-coral">
            {name}
          </p>
        ) : null}

        {title ? (
          <h3 className="font-heading text-base font-semibold tracking-tight text-balance sm:text-lg">
            {title}
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
              <span className="inline-flex min-h-8 max-w-[60%] items-center gap-1.5 rounded-md bg-brand-subtle px-2.5 py-1.5 text-xs font-semibold leading-snug tracking-tight text-foreground">
                <TrendingUp aria-hidden className="size-3.5 shrink-0 text-brand" />
                {story.stat}
              </span>
            ) : (
              <span />
            )}

            {href ? <span className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-asip-coral underline-offset-4 group-hover:underline">{copy.readStory}</span> : null}
          </div>
        )}
      </div>
    </article>
  );

  return href ? (
    <Link href={href} className="group block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      {card}
    </Link>
  ) : card;
}
