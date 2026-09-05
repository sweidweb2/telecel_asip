"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { ImpactCaseStudyCard } from "@/components/marketing/impact-case-study-card";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { cn } from "@/lib/utils";
import type { ImpactCaseStudyPublic } from "@/types/founder-story";
import type { ImpactPageCopy } from "@/types/marketing-page";

const INITIAL_VISIBLE = 3;
const LOAD_MORE_STEP = 3;

type ImpactCaseStudiesScrollerProps = {
  locale: Locale;
  copy: ImpactPageCopy["caseStudy"];
  stories: ImpactCaseStudyPublic[];
};

/**
 * Horizontal snap scroller — 1 card on mobile, 2–3 from md — plus load more.
 */
export function ImpactCaseStudiesScroller({
  locale,
  copy,
  stories,
}: ImpactCaseStudiesScrollerProps) {
  const scrollerRef = useRef<HTMLUListElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(
    Math.min(INITIAL_VISIBLE, stories.length),
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const visibleStories = stories.slice(0, visibleCount);
  const canLoadMore = visibleCount < stories.length;
  const showControls = stories.length > 1;

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }
    const max = el.scrollWidth - el.clientWidth;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const resize = new ResizeObserver(updateScrollState);
    resize.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      resize.disconnect();
    };
  }, [visibleStories.length, updateScrollState]);

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.85, 280);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  const navButtons = (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="min-h-11 min-w-11 rounded-full"
        aria-label={copy.prevLabel}
        disabled={!canScrollPrev}
        onClick={() => scrollByDir(-1)}
      >
        <ChevronLeftIcon />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="min-h-11 min-w-11 rounded-full"
        aria-label={copy.nextLabel}
        disabled={!canScrollNext}
        onClick={() => scrollByDir(1)}
      >
        <ChevronRightIcon />
      </Button>
    </>
  );

  return (
    <div>
      {showControls ? (
        <div className="mb-4 hidden justify-end gap-1 sm:flex">{navButtons}</div>
      ) : null}

      <ul
        ref={scrollerRef}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 sm:gap-5",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {visibleStories.map((story) => (
          <li
            key={story.id}
            className={cn(
              "snap-start",
              stories.length === 1
                ? "w-full max-w-3xl"
                : "w-[min(20.5rem,85vw)] shrink-0 sm:w-[min(28rem,80vw)] md:w-[calc(50%-0.625rem)] xl:w-[calc((100%-2.5rem)/3)]",
            )}
          >
            <ImpactCaseStudyCard locale={locale} copy={copy} story={story} />
          </li>
        ))}
      </ul>

      {showControls ? (
        <div className="mt-4 flex items-center justify-end gap-1 sm:hidden">
          {navButtons}
        </div>
      ) : null}

      {canLoadMore ? (
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full rounded-full px-6 sm:w-auto"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + LOAD_MORE_STEP, stories.length),
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
