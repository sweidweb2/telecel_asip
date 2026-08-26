"use client";

import { useEffect, useDeferredValue, useMemo, useState } from "react";
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
import { foundedYearFromDate } from "@/lib/startup-display";
import type { StartupPublicListItem } from "@/types/startup";

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
  startups: StartupPublicListItem[];
  /** From `?year=YYYY` — `"all"` when unset. */
  initialYear?: string;
};

export function PortfolioStartupsGrid({
  locale,
  startups,
  initialYear = "all",
}: PortfolioStartupsGridProps) {
  const labels = FILTER_LABELS[locale];
  const router = useRouter();
  const pathname = usePathname();
  const [nameQuery, setNameQuery] = useState("");
  const [year, setYear] = useState(initialYear);
  const deferredName = useDeferredValue(nameQuery);

  useEffect(() => {
    setYear(initialYear);
  }, [initialYear]);

  const years = useMemo(() => {
    const values = new Set<string>();
    for (const startup of startups) {
      const value = foundedYearFromDate(startup.founded_at);
      if (value) values.add(value);
    }
    return [...values].sort((a, b) => Number(b) - Number(a));
  }, [startups]);

  function updateYear(next: string) {
    setYear(next);
    const qs = next !== "all" ? `?year=${encodeURIComponent(next)}` : "";
    router.replace(`${pathname}${qs}`, { scroll: false });
  }

  const filtered = useMemo(() => {
    const query = deferredName.trim().toLowerCase();
    return startups.filter((startup) => {
      if (query && !startup.name.toLowerCase().includes(query)) {
        return false;
      }
      if (year !== "all") {
        if (foundedYearFromDate(startup.founded_at) !== year) return false;
      }
      return true;
    });
  }, [startups, deferredName, year]);

  const resultsLabel = (
    filtered.length === 1 ? labels.results : labels.resultsPlural
  ).replace("{count}", String(filtered.length));

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
            if (value) updateYear(value);
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

      {startups.length === 0 ? (
        <p className="rounded-2xl border border-dashed px-6 py-12 text-center text-muted-foreground">
          {labels.emptyAll}
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed px-6 py-12 text-center text-muted-foreground">
          {labels.empty}
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{resultsLabel}</p>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-8">
            {filtered.map((startup) => (
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
