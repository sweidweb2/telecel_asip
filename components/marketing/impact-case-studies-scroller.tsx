"use client";

import { useState } from "react";

import { ImpactCaseStudyCard } from "@/components/marketing/impact-case-study-card";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import type { ImpactCaseStudyPublic } from "@/types/founder-story";
import type { ImpactPageCopy } from "@/types/marketing-page";

/** First paint: 3 cards. Load more adds 3 until the section cap. */
const INITIAL_VISIBLE = 3;
const LOAD_MORE_STEP = 3;
/** Hard cap for this Impact section (matches data fetch limit). */
export const IMPACT_CASE_STUDIES_MAX = 9;

type ImpactCaseStudiesScrollerProps = {
  locale: Locale;
  copy: ImpactPageCopy["caseStudy"];
  stories: ImpactCaseStudyPublic[];
};

/**
 * Compact case-study grid — 1 / 2 / 3 columns — with Load more under the grid.
 */
export function ImpactCaseStudiesScroller({
  locale,
  copy,
  stories,
}: ImpactCaseStudiesScrollerProps) {
  const cappedStories = stories.slice(0, IMPACT_CASE_STUDIES_MAX);
  const [visibleCount, setVisibleCount] = useState(
    Math.min(INITIAL_VISIBLE, cappedStories.length),
  );

  const visibleStories = cappedStories.slice(0, visibleCount);
  const canLoadMore = visibleCount < cappedStories.length;

  return (
    <div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {visibleStories.map((story) => (
          <li key={story.id} className="min-w-0">
            <ImpactCaseStudyCard locale={locale} copy={copy} story={story} />
          </li>
        ))}
      </ul>

      {canLoadMore ? (
        <div className="mt-8 flex justify-center sm:mt-10">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full rounded-full px-6 sm:w-auto"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + LOAD_MORE_STEP, cappedStories.length),
              )
            }
          >
            {copy.loadMore}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
