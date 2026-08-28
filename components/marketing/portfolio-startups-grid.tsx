"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { SearchIcon } from "lucide-react";

import { StartupCard } from "@/components/marketing/startup-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Locale } from "@/constants/locales";
import type { StartupPublicListItem } from "@/types/startup";

const SEARCH_DEBOUNCE_MS = 300;

const FILTER_LABELS = {
  en: {
    searchPlaceholder: "Search by name",
    yearAll: "All years",
    yearLabel: "Founded year",
    empty: "No startups match your filters.",
    emptyAll: "No active startups to show yet.",
    results: "{count} startup",
    resultsPlural: "{count} startups",
  },
  fr: {
    searchPlaceholder: "Rechercher par nom",
    yearAll: "Toutes les années",
    yearLabel: "Année de fondation",
    empty: "Aucune startup ne correspond à vos filtres.",
    emptyAll: "Aucune startup active à afficher pour le moment.",
    results: "{count} startup",
    resultsPlural: "{count} startups",
  },
} as const;

type PortfolioStartupsGridProps = {
  locale: Locale;
  /** Current page only — filtering and paging happen in Postgres. */
  startups: StartupPublicListItem[];
  /** Matching rows across every page. */
  total: number;
  /** Founded years across all active startups, for the filter options. */
  years: string[];
  /** From `?year=YYYY` — `"all"` when unset. */
  year?: string;
  /** From `?q=`. */
  search?: string;
};

export function PortfolioStartupsGrid({
  locale,
  startups,
  total,
  years,
  year = "all",
  search = "",
}: PortfolioStartupsGridProps) {
  const labels = FILTER_LABELS[locale];
  const router = useRouter();
  const pathname = usePathname();
  const [nameQuery, setNameQuery] = useState(search);

  const updateParams = useCallback(
    (patch: { year?: string; q?: string }) => {
      const next = { year, q: search, ...patch };
      const params = new URLSearchParams();
      if (next.year && next.year !== "all") params.set("year", next.year);
      if (next.q) params.set("q", next.q);
      // Any filter change invalidates the current page number.
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, search, year],
  );

  useEffect(() => {
    if (nameQuery === search) return;
    const timer = setTimeout(
      () => updateParams({ q: nameQuery }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [nameQuery, search, updateParams]);

  const hasFilters = year !== "all" || search !== "";
  const resultsLabel = (
    total === 1 ? labels.results : labels.resultsPlural
  ).replace("{count}", String(total));

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={nameQuery}
            onChange={(event) => setNameQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchPlaceholder}
            className="min-h-11 pl-9"
          />
        </div>
        <Select
          value={year}
          onValueChange={(value) => {
            if (value) updateParams({ year: value });
          }}
        >
          <SelectTrigger
            className="min-h-11 w-full sm:w-44"
            aria-label={labels.yearLabel}
          >
            <SelectValue placeholder={labels.yearAll} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{labels.yearAll}</SelectItem>
            {years.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {total === 0 ? (
        <p className="rounded-2xl border border-dashed px-6 py-12 text-center text-muted-foreground">
          {hasFilters ? labels.empty : labels.emptyAll}
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{resultsLabel}</p>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-8">
            {startups.map((startup) => (
              <li key={startup.id} className="min-w-0">
                <StartupCard startup={startup} locale={locale} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
