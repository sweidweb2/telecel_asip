"use client";

import { useState } from "react";

import { ImpactCaseStudyCard } from "@/components/marketing/impact-case-study-card";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import type { ImpactCaseStudyPublic } from "@/types/founder-story";
import type { ImpactPageCopy } from "@/types/marketing-page";

const LOAD_MORE_STEP = 3;

type ImpactCaseStudiesLoadMoreProps = {
  locale: Locale;
  copy: ImpactPageCopy["caseStudy"];
  remaining: ImpactCaseStudyPublic[];
};

/**
 * Client island: append remaining case-study cards in steps of 3.
 */
export function ImpactCaseStudiesLoadMore({
  locale,
  copy,
  remaining,
}: ImpactCaseStudiesLoadMoreProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  const visibleExtra = remaining.slice(0, visibleCount);
  const canLoadMore = visibleCount < remaining.length;

  if (remaining.length === 0) return null;

  return (
    <>
      {visibleExtra.length > 0 ? (
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {visibleExtra.map((story) => (
            <li key={story.id} className="min-w-0">
              <ImpactCaseStudyCard locale={locale} copy={copy} story={story} />
            </li>
          ))}
        </ul>
      ) : null}

      {canLoadMore ? (
        <div className="mt-8 flex justify-center sm:mt-10">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full rounded-full px-6 sm:w-auto"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + LOAD_MORE_STEP, remaining.length),
              )
            }
          >
            {copy.loadMore}
          </Button>
        </div>
      ) : null}
    </>
  );
}
