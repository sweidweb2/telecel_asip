"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { BlogCard } from "@/components/marketing/blog-card";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { cn } from "@/lib/utils";
import type { ArticleListItem } from "@/types/article";

type HomeInsightsCarouselProps = {
  locale: Locale;
  articles: ArticleListItem[];
};

/**
 * Client island: drag + prev/next scroller for home latest insights cards.
 */
export function HomeInsightsCarousel({
  locale,
  articles,
}: HomeInsightsCarouselProps) {
  const scrollerRef = useRef<HTMLUListElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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
  }, [articles.length, updateScrollState]);

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.8, 280);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  function onPointerDown(event: ReactPointerEvent<HTMLUListElement>) {
    if (event.button !== 0) return;
    const el = scrollerRef.current;
    if (!el) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    };
    el.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLUListElement>) {
    const drag = dragRef.current;
    const el = scrollerRef.current;
    if (!drag || !el || drag.pointerId !== event.pointerId) return;

    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 6) drag.moved = true;
    if (!drag.moved) return;

    el.scrollLeft = drag.startScroll - delta;
    event.preventDefault();
  }

  function endDrag(event: ReactPointerEvent<HTMLUListElement>) {
    const drag = dragRef.current;
    const el = scrollerRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (drag.moved) suppressClickRef.current = true;
    if (el?.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  }

  function onClickCapture(event: MouseEvent<HTMLUListElement>) {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  }

  const navButtons = (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="min-h-11 min-w-11 rounded-full"
        aria-label="Previous insights"
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
        aria-label="Next insights"
        disabled={!canScrollNext}
        onClick={() => scrollByDir(1)}
      >
        <ChevronRightIcon />
      </Button>
    </>
  );

  return (
    <div className="relative mt-6 sm:mt-8">
      <div className="mb-4 hidden items-center justify-end gap-1 sm:flex">
        {navButtons}
      </div>

      <ul
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        className={cn(
          "flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-6 [&::-webkit-scrollbar]:hidden",
          "cursor-grab touch-pan-y active:cursor-grabbing select-none",
        )}
      >
        {articles.map((article) => (
          <li
            key={article.id}
            className="w-[min(100%,20rem)] shrink-0 snap-start sm:w-[22rem] lg:w-[24rem]"
          >
            <BlogCard
              article={article}
              locale={locale}
              className="h-full rounded-2xl border border-border/70 p-3 sm:p-3.5"
            />
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-end gap-1 sm:hidden">
        {navButtons}
      </div>
    </div>
  );
}
