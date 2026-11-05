"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { cn } from "@/lib/utils";
import type { CohortPublicListItem } from "@/types/cohort";

const PAGE_SIZE = 5;
const FEATURED_CARD_COUNT = 4;

function formatCohortWindow(cohort: CohortPublicListItem) {
  if (!cohort.programme_dates_start || !cohort.programme_dates_end) {
    return null;
  }
  try {
    const start = format(parseISO(cohort.programme_dates_start), "MMM yyyy");
    const end = format(parseISO(cohort.programme_dates_end), "MMM yyyy");
    return `${start} – ${end}`;
  } catch {
    return null;
  }
}

function programmeStatusLabel(
  status: CohortPublicListItem["programme_status"],
  locale: Locale,
) {
  if (locale === "fr") {
    if (status === "open") return "Ouvert";
    if (status === "hold") return "En attente";
    return "Clôturé";
  }
  if (status === "open") return "Open";
  if (status === "hold") return "On hold";
  return "Closed";
}

function padIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

type ProgrammePastChaptersSectionProps = {
  locale: Locale;
  cohorts: CohortPublicListItem[];
};

/**
 * Programme past chapters — paged list on the left, horizontal stacked chapter cards on the right.
 */
export function ProgrammePastChaptersSection({
  locale,
  cohorts,
}: ProgrammePastChaptersSectionProps) {
  const titleId = useId();
  const pastTitle = locale === "fr" ? "Chapitres publiés" : "Past chapters";
  const note = locale === "fr" ? "Cohortes en direct" : "Live cohorts";
  const empty =
    locale === "fr"
      ? "Les chapitres publiés apparaîtront ici."
      : "Published chapters will appear here.";
  const cardsLabel =
    locale === "fr" ? "Chapitres mis en avant" : "Featured chapters";

  const chronological = useMemo(
    () =>
      [...cohorts].sort(
        (a, b) => a.year - b.year || a.public_label.localeCompare(b.public_label),
      ),
    [cohorts],
  );

  const featured = chronological.slice(0, FEATURED_CARD_COUNT);

  const pageCount = Math.max(1, Math.ceil(cohorts.length / PAGE_SIZE));
  const [page, setPage] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(
    cohorts[0]?.id ?? null,
  );
  const [trackedCohorts, setTrackedCohorts] = useState(cohorts);
  if (trackedCohorts !== cohorts) {
    setTrackedCohorts(cohorts);
    setPage(0);
    setActiveId(cohorts[0]?.id ?? null);
  }

  const pageItems = cohorts.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const showPager = cohorts.length > PAGE_SIZE;

  function goToPage(next: number) {
    const clamped = Math.max(0, Math.min(pageCount - 1, next));
    setPage(clamped);
    const first = cohorts[clamped * PAGE_SIZE];
    if (first) setActiveId(first.id);
  }

  function selectChapter(id: string) {
    setActiveId(id);
    const index = cohorts.findIndex((c) => c.id === id);
    if (index >= 0) setPage(Math.floor(index / PAGE_SIZE));
  }

  return (
    <section
      aria-labelledby={titleId}
      className="border-b border-border bg-background"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="max-w-2xl">
          <h2
            id={titleId}
            className="font-heading text-xl font-semibold tracking-tight text-balance text-asip-ink sm:text-2xl"
          >
            {pastTitle}
          </h2>
          <p className="mt-1 text-sm text-asip-ink/70 sm:text-base">{note}</p>
        </div>

        {cohorts.length === 0 ? (
          <p className="mt-6 text-sm text-asip-ink/65">{empty}</p>
        ) : (
          <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-2 lg:items-stretch lg:gap-8">
            <div className="flex min-w-0 flex-col self-stretch">
              <div
                className="relative min-h-0 flex-1 overflow-hidden"
                aria-live="polite"
              >
                <ul className="space-y-0 divide-y divide-asip-ink/12">
                  {pageItems.map((cohort) => {
                    const window = formatCohortWindow(cohort);
                    const isActive = cohort.id === activeId;
                    return (
                      <li key={cohort.id}>
                        <button
                          type="button"
                          onClick={() => selectChapter(cohort.id)}
                          className={cn(
                            "group w-full min-h-11 rounded-none px-1 py-2.5 text-left transition-colors duration-200 outline-none",
                            "focus-visible:bg-brand/8 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            isActive
                              ? "bg-brand/8"
                              : "hover:bg-asip-ink/5",
                          )}
                          aria-current={isActive ? "true" : undefined}
                        >
                          <div className="flex items-center gap-3">
                            {cohort.media_url ? (
                              <Image
                                src={cohort.media_url}
                                alt=""
                                width={160}
                                height={90}
                                sizes="96px"
                                className="hidden aspect-video w-24 shrink-0 rounded-md border border-asip-ink/10 object-cover sm:block"
                              />
                            ) : null}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <span
                                  className={cn(
                                    "font-heading text-sm font-semibold tracking-tight sm:text-base",
                                    isActive
                                      ? "text-brand"
                                      : "text-asip-ink group-hover:text-brand",
                                  )}
                                >
                                  {cohort.year}
                                  <span className="font-medium text-asip-ink">
                                    {" - "}
                                    {cohort.public_label}
                                  </span>
                                </span>
                                <span
                                  className={cn(
                                    "shrink-0 text-[10px] font-medium tracking-wide uppercase sm:text-xs",
                                    isActive
                                      ? "text-brand"
                                      : "text-asip-ink/55",
                                  )}
                                >
                                  {programmeStatusLabel(
                                    cohort.programme_status,
                                    locale,
                                  )}
                                </span>
                              </div>
                              {window ? (
                                <p className="mt-0.5 text-xs text-asip-ink/60">
                                  {window}
                                </p>
                              ) : null}
                              {cohort.summary ? (
                                <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-asip-ink/65">
                                  {cohort.summary}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {showPager ? (
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-asip-ink/12 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="min-h-11 min-w-11 rounded-full border-asip-ink/20 bg-transparent text-asip-ink hover:bg-asip-ink/5"
                    aria-label={
                      locale === "fr" ? "Chapitres précédents" : "Previous chapters"
                    }
                    disabled={page === 0}
                    onClick={() => goToPage(page - 1)}
                  >
                    <ChevronLeftIcon />
                  </Button>

                  <div
                    className="flex items-center gap-2"
                    role="tablist"
                    aria-label={
                      locale === "fr" ? "Pages de chapitres" : "Chapter pages"
                    }
                  >
                    {Array.from({ length: pageCount }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        role="tab"
                        aria-selected={i === page}
                        aria-label={
                          locale === "fr"
                            ? `Page ${i + 1} sur ${pageCount}`
                            : `Page ${i + 1} of ${pageCount}`
                        }
                        className={cn(
                          "h-2.5 rounded-full transition-[width,background-color] duration-300 ease-out",
                          i === page
                            ? "w-7 bg-brand"
                            : "w-2.5 bg-asip-ink/25 hover:bg-asip-ink/40",
                        )}
                        onClick={() => goToPage(i)}
                      />
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="min-h-11 min-w-11 rounded-full border-asip-ink/20 bg-transparent text-asip-ink hover:bg-asip-ink/5"
                    aria-label={
                      locale === "fr" ? "Chapitres suivants" : "Next chapters"
                    }
                    disabled={page >= pageCount - 1}
                    onClick={() => goToPage(page + 1)}
                  >
                    <ChevronRightIcon />
                  </Button>
                </div>
              ) : null}
            </div>

            <PastChaptersCards
              cohorts={featured}
              activeId={activeId}
              locale={locale}
              label={cardsLabel}
              onSelect={selectChapter}
            />
          </div>
        )}
      </div>
    </section>
  );
}

type PastChaptersCardsProps = {
  cohorts: CohortPublicListItem[];
  activeId: string | null;
  locale: Locale;
  label: string;
  onSelect: (id: string) => void;
};

function PastChaptersCards({
  cohorts,
  activeId,
  locale,
  label,
  onSelect,
}: PastChaptersCardsProps) {
  if (cohorts.length === 0) return null;

  return (
    <div
      className="flex h-full min-h-[18rem] w-full items-stretch justify-start overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:min-h-[20rem] lg:min-h-0 lg:justify-end lg:overflow-visible [&::-webkit-scrollbar]:hidden"
      role="list"
      aria-label={label}
    >
      {cohorts.map((cohort, index) => {
        const window = formatCohortWindow(cohort);
        const isActive = cohort.id === activeId;
        const body =
          cohort.summary?.trim() ||
          window ||
          programmeStatusLabel(cohort.programme_status, locale);

        return (
          <button
            key={cohort.id}
            type="button"
            role="listitem"
            onClick={() => onSelect(cohort.id)}
            aria-current={isActive ? "true" : undefined}
            aria-label={`${cohort.year} - ${cohort.public_label}`}
            style={{ zIndex: index + 1 }}
            className={cn(
              "group relative flex h-full min-h-[18rem] w-[8.5rem] shrink-0 flex-col overflow-hidden rounded-2xl bg-white p-4 text-left shadow-[0_12px_28px_-16px_color-mix(in_srgb,var(--asip-ink)_45%,transparent)] transition-[transform,box-shadow,ring-color] duration-300 ease-out sm:min-h-[20rem] sm:w-[9.5rem] sm:p-5 lg:min-h-0 lg:w-[min(10.5rem,28%)]",
              "outline-none focus-visible:ring-2 focus-visible:ring-brand/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              index > 0 && "-ml-6 sm:-ml-7",
              index % 2 === 0 ? "translate-y-0" : "translate-y-1",
              "hover:z-20 hover:-translate-y-1 hover:shadow-[0_16px_32px_-14px_color-mix(in_srgb,var(--asip-ink)_50%,transparent)]",
              isActive ? "ring-2 ring-brand/40" : "ring-1 ring-asip-ink/8",
            )}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: [
                  "radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--brand) 18%, transparent) 0%, transparent 42%)",
                  "radial-gradient(circle at 100% 0%, transparent 28%, color-mix(in srgb, var(--brand) 11%, transparent) 29%, transparent 48%)",
                  "radial-gradient(circle at 100% 0%, transparent 48%, color-mix(in srgb, var(--brand-mid) 10%, transparent) 49%, transparent 68%)",
                  "radial-gradient(circle at 100% 0%, transparent 68%, color-mix(in srgb, var(--brand-soft) 55%, transparent) 69%, transparent 88%)",
                ].join(", "),
              }}
            />

            <span
              className={cn(
                "relative font-heading text-2xl font-bold tracking-tight sm:text-3xl",
                isActive ? "text-brand" : "text-asip-ink",
              )}
            >
              {padIndex(index)}
            </span>

            <div className="relative mt-auto pt-6">
              <h3 className="font-heading text-sm font-semibold tracking-tight text-balance text-asip-ink sm:text-base">
                {cohort.year}
                <span className="font-semibold">
                  {": "}
                  {cohort.public_label}
                </span>
              </h3>
              <p className="mt-1.5 line-clamp-5 text-xs leading-relaxed text-asip-ink/60 sm:text-sm">
                {body}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
