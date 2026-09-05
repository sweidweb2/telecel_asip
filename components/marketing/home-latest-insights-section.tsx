"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { BlogCard } from "@/components/marketing/blog-card";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { ArticleListItem } from "@/types/article";
import type { HomePageCopy } from "@/types/marketing-page";

type HomeLatestInsightsSectionProps = {
  locale: Locale;
  copy: HomePageCopy["latest"];
  articles: ArticleListItem[];
  className?: string;
};

/**
 * Home Module 09 — latest insights carousel (drag + prev/next).
 */
export function HomeLatestInsightsSection({
  locale,
  copy,
  articles,
  className,
}: HomeLatestInsightsSectionProps) {
  const insightsHref = publicPath(locale, copy.cta.slug);
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

  return (
    <section
      className={cn(
        "border-t border-border bg-background px-4 pt-8 pb-14 sm:px-6 sm:pt-10 sm:pb-16 lg:px-8 lg:pt-12 lg:pb-20",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">
              {copy.eyebrow}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl lg:text-4xl">
              {copy.title}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {articles.length > 0 ? (
              <div className="hidden items-center gap-1 sm:flex">
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
              </div>
            ) : null}
            <Link
              href={insightsHref}
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "min-h-11 rounded-full px-4 text-sm sm:px-6 sm:text-base",
              )}
            >
              {copy.cta.label}
            </Link>
          </div>
        </div>

        {articles.length > 0 ? (
          <div className="relative mt-6 sm:mt-8">
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
                  <BlogCard article={article} locale={locale} />
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-end gap-1 sm:hidden">
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
            </div>
          </div>
        ) : (
          <p className="mt-6 text-base text-muted-foreground sm:mt-8">
            {copy.empty}
          </p>
        )}
      </div>
    </section>
  );
}
