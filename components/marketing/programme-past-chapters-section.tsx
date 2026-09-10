"use client";

import Image from "next/image";
import {
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { format, parseISO } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { cn } from "@/lib/utils";
import type { CohortPublicListItem } from "@/types/cohort";

const PAGE_SIZE = 5;

const STATUS_FILL: Record<
  CohortPublicListItem["programme_status"],
  string
> = {
  open: "var(--brand)",
  hold: "var(--brand-mid)",
  closed: "var(--asip-ink)",
};

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

type ProgrammePastChaptersSectionProps = {
  locale: Locale;
  cohorts: CohortPublicListItem[];
};

/**
 * Programme past chapters — paged list on the left, continuity graph on the right.
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
  const graphCaption =
    locale === "fr"
      ? "Continuité des chapitres dans le temps"
      : "Chapter continuity over time";

  const chronological = useMemo(
    () => [...cohorts].sort((a, b) => a.year - b.year || a.public_label.localeCompare(b.public_label)),
    [cohorts],
  );

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
      className="border-b border-border bg-[#fbfaf6]"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="max-w-2xl">
          <h2
            id={titleId}
            className="font-heading text-xl font-semibold tracking-tight text-balance text-[#14333b] sm:text-2xl"
          >
            {pastTitle}
          </h2>
          <p className="mt-1 text-sm text-[#14333b]/70 sm:text-base">{note}</p>
        </div>

        {cohorts.length === 0 ? (
          <p className="mt-6 text-sm text-[#14333b]/65">{empty}</p>
        ) : (
          <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-2 lg:gap-8 lg:items-stretch">
            <div className="flex min-w-0 flex-col">
              <div
                className="relative min-h-0 flex-1 overflow-hidden"
                aria-live="polite"
              >
                <ul className="space-y-0 divide-y divide-[#14333b]/12">
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
                            "focus-visible:bg-[#179191]/8 focus-visible:ring-2 focus-visible:ring-[#179191]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfaf6]",
                            isActive
                              ? "bg-[#179191]/8"
                              : "hover:bg-[#14333b]/5",
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
                                className="hidden aspect-video w-24 shrink-0 rounded-md border border-[#14333b]/10 object-cover sm:block"
                              />
                            ) : null}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <span
                                  className={cn(
                                    "font-heading text-sm font-semibold tracking-tight sm:text-base",
                                    isActive
                                      ? "text-[#179191]"
                                      : "text-[#14333b] group-hover:text-[#179191]",
                                  )}
                                >
                                  {cohort.year}
                                  <span className="font-medium text-[#14333b]">
                                    {" - "}
                                    {cohort.public_label}
                                  </span>
                                </span>
                                <span
                                  className={cn(
                                    "shrink-0 text-[10px] font-medium tracking-wide uppercase sm:text-xs",
                                    isActive
                                      ? "text-[#179191]"
                                      : "text-[#14333b]/55",
                                  )}
                                >
                                  {programmeStatusLabel(
                                    cohort.programme_status,
                                    locale,
                                  )}
                                </span>
                              </div>
                              {window ? (
                                <p className="mt-0.5 text-xs text-[#14333b]/60">
                                  {window}
                                </p>
                              ) : null}
                              {cohort.summary ? (
                                <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-[#14333b]/65">
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
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#14333b]/12 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="min-h-11 min-w-11 rounded-full border-[#14333b]/20 bg-transparent text-[#14333b] hover:bg-[#14333b]/5"
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
                            ? "w-7 bg-[#179191]"
                            : "w-2.5 bg-[#14333b]/25 hover:bg-[#14333b]/40",
                        )}
                        onClick={() => goToPage(i)}
                      />
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="min-h-11 min-w-11 rounded-full border-[#14333b]/20 bg-transparent text-[#14333b] hover:bg-[#14333b]/5"
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

            <PastChaptersGraph
              cohorts={chronological}
              activeId={activeId}
              locale={locale}
              caption={graphCaption}
              onSelect={selectChapter}
            />
          </div>
        )}
      </div>
    </section>
  );
}

type PastChaptersGraphProps = {
  cohorts: CohortPublicListItem[];
  activeId: string | null;
  locale: Locale;
  caption: string;
  onSelect: (id: string) => void;
};

function PastChaptersGraph({
  cohorts,
  activeId,
  locale,
  caption,
  onSelect,
}: PastChaptersGraphProps) {
  const gradientId = useId().replace(/:/g, "");
  const width = 560;
  const height = 280;
  const padX = 40;
  const padY = 36;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;

  const points = cohorts.map((cohort, index) => {
    const t =
      cohorts.length === 1 ? 0.5 : index / Math.max(1, cohorts.length - 1);
    const x = padX + t * plotW;
    // Wave elevation — open chapters peak, closed sit lower, hold mid
    const statusLift =
      cohort.programme_status === "open"
        ? 0.82
        : cohort.programme_status === "hold"
          ? 0.55
          : 0.28;
    const wave = 0.35 + 0.45 * Math.sin(t * Math.PI);
    const yNorm = Math.min(0.92, Math.max(0.12, statusLift * 0.55 + wave * 0.45));
    const y = padY + (1 - yNorm) * plotH;
    return { cohort, x, y, t };
  });

  const tickYears = useMemo(() => {
    const unique = [...new Set(cohorts.map((c) => c.year))].sort((a, b) => a - b);
    if (unique.length <= 4) return unique;
    return [
      unique[0],
      unique[Math.floor(unique.length / 3)],
      unique[Math.floor((unique.length * 2) / 3)],
      unique[unique.length - 1],
    ];
  }, [cohorts]);

  const pathD =
    points.length === 0
      ? ""
      : points.length === 1
        ? `M ${points[0].x} ${points[0].y}`
        : points
            .map((p, i) => {
              if (i === 0) return `M ${p.x} ${p.y}`;
              const prev = points[i - 1];
              const cx = (prev.x + p.x) / 2;
              return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
            })
            .join(" ");

  const areaD =
    points.length === 0
      ? ""
      : `${pathD} L ${points[points.length - 1].x} ${padY + plotH} L ${points[0].x} ${padY + plotH} Z`;

  function onNodeKeyDown(
    event: KeyboardEvent<SVGGElement>,
    id: string,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(id);
    }
  }

  const statusLegend =
    locale === "fr"
      ? ([
          ["open", "Ouvert"],
          ["hold", "En attente"],
          ["closed", "Clôturé"],
        ] as const)
      : ([
          ["open", "Open"],
          ["hold", "On hold"],
          ["closed", "Closed"],
        ] as const);

  return (
    <aside
      className="relative flex min-h-[14rem] flex-col justify-center overflow-hidden rounded-2xl border border-[#14333b]/10 bg-white px-3 py-3 shadow-[0_12px_28px_-20px_rgba(20,51,59,0.35)] sm:min-h-[16rem] sm:px-4 sm:py-4"
      aria-label={caption}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 18%, rgba(23,145,145,0.12), transparent 40%), radial-gradient(circle at 82% 72%, rgba(193,74,155,0.08), transparent 38%)",
        }}
      />

      <p className="relative px-2 text-xs font-medium text-[#14333b]/65 sm:text-sm">
        {caption}
      </p>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="relative mt-1 h-auto w-full"
        role="img"
        aria-label={caption}
      >
        <defs>
          <linearGradient id={`fill-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#179191" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#179191" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Year baseline */}
        <line
          x1={padX}
          y1={padY + plotH}
          x2={padX + plotW}
          y2={padY + plotH}
          stroke="rgba(20,51,59,0.16)"
          strokeWidth="1"
        />

        {tickYears.map((year) => {
          const firstIndex = cohorts.findIndex((c) => c.year === year);
          const t =
            cohorts.length === 1
              ? 0.5
              : firstIndex / Math.max(1, cohorts.length - 1);
          const x = padX + t * plotW;
          return (
            <g key={`tick-${year}`}>
              <line
                x1={x}
                y1={padY + plotH}
                x2={x}
                y2={padY + plotH + 6}
                stroke="rgba(20,51,59,0.22)"
                strokeWidth="1"
              />
              <text
                x={x}
                y={padY + plotH + 20}
                textAnchor="middle"
                fill="rgba(20,51,59,0.5)"
                fontSize="10"
              >
                {year}
              </text>
            </g>
          );
        })}

        {points.length > 1 ? (
          <path d={areaD} fill={`url(#fill-${gradientId})`} />
        ) : null}

        {points.length > 0 ? (
          <path
            d={pathD}
            fill="none"
            stroke="#179191"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        ) : null}

        {points.map(({ cohort, x, y }) => {
          const isActive = cohort.id === activeId;
          const fill = STATUS_FILL[cohort.programme_status];
          return (
            <g
              key={cohort.id}
              transform={`translate(${x} ${y})`}
              role="button"
              tabIndex={0}
              aria-label={`${cohort.year} - ${cohort.public_label}`}
              aria-current={isActive ? "true" : undefined}
              className="cursor-pointer outline-none"
              onClick={() => onSelect(cohort.id)}
              onKeyDown={(event) => onNodeKeyDown(event, cohort.id)}
            >
              {isActive ? (
                <circle
                  r="16"
                  fill="none"
                  stroke="#179191"
                  strokeWidth="1.5"
                  opacity="0.45"
                  className="motion-safe:animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite]"
                />
              ) : null}
              <circle
                r={isActive ? 9 : 6.5}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={isActive ? 2.5 : 2}
                className="transition-[r] duration-300 ease-out"
              />
              <text
                y="24"
                textAnchor="middle"
                fill="rgba(20,51,59,0.72)"
                fontSize="10"
                fontWeight="500"
              >
                {cohort.year}
              </text>
            </g>
          );
        })}
      </svg>

      <ul className="relative mt-0.5 flex flex-wrap gap-x-4 gap-y-1.5 px-2 text-xs text-[#14333b]/60">
        {statusLegend.map(([status, label]) => (
          <li key={status} className="inline-flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: STATUS_FILL[status] }}
              aria-hidden
            />
            {label}
          </li>
        ))}
      </ul>
    </aside>
  );
}
