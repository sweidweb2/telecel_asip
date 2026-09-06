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
import type { StartupFilterOptions, StartupPublicListItem } from "@/types/startup";
import type { ActiveStartupFilters } from "@/validations/startup";

const LABELS = {
  en: {
    search: "Search companies or solutions",
    cohort: "Cohort",
    country: "Country",
    sector: "Sector",
    empty: "No companies match these filters.",
    emptyAll: "Founder profiles are being prepared for publication.",
    result: "{count} company",
    results: "{count} companies",
  },
  fr: {
    search: "Rechercher une entreprise ou une solution",
    cohort: "Cohorte",
    country: "Pays",
    sector: "Secteur",
    empty: "Aucune entreprise ne correspond a ces filtres.",
    emptyAll: "Les profils des fondateurs sont en cours de preparation.",
    result: "{count} entreprise",
    results: "{count} entreprises",
  },
} as const;

type PortfolioStartupsGridProps = {
  locale: Locale;
  startups: StartupPublicListItem[];
  total: number;
  options: StartupFilterOptions;
  filters: ActiveStartupFilters;
  fromPage?: number;
};

export function PortfolioStartupsGrid({
  locale,
  startups,
  total,
  options,
  filters,
  fromPage = 1,
}: PortfolioStartupsGridProps) {
  const labels = LABELS[locale];
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(filters.query);
  const countryNames = new Intl.DisplayNames([locale], { type: "region" });

  const updateParams = useCallback(
    (patch: Partial<ActiveStartupFilters>) => {
      const next = { ...filters, ...patch };
      const params = new URLSearchParams();
      if (next.cohort) params.set("cohort", next.cohort);
      if (next.country) params.set("country", next.country);
      if (next.sector) params.set("sector", next.sector);
      if (next.query) params.set("q", next.query);
      const search = params.toString();
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      });
    },
    [filters, pathname, router],
  );

  useEffect(() => {
    if (query === filters.query) return;
    const timer = setTimeout(() => updateParams({ query }), 300);
    return () => clearTimeout(timer);
  }, [filters.query, query, updateParams]);

  const filtered = Boolean(
    filters.cohort || filters.country || filters.sector || filters.query,
  );
  const resultLabel = (total === 1 ? labels.result : labels.results).replace(
    "{count}",
    String(total),
  );

  function filterSelect(
    value: string | null,
    fieldLabel: string,
    values: string[],
    key: "cohort" | "country" | "sector",
  ) {
    const optionLabel = (item: string) =>
      key === "country" ? (countryNames.of(item) ?? item) : item;

    const items = [
      { value: "all", label: fieldLabel },
      ...values.map((item) => ({ value: item, label: optionLabel(item) })),
    ];

    return (
      <Select
        value={value ?? "all"}
        items={items}
        onValueChange={(next) =>
          updateParams({ [key]: next === "all" ? null : next })
        }
      >
        <SelectTrigger
          className="min-h-12 w-full bg-background"
          aria-label={fieldLabel}
        >
          <SelectValue placeholder={fieldLabel}>
            {(selected: string | null) =>
              selected && selected !== "all"
                ? optionLabel(selected)
                : fieldLabel
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{fieldLabel}</SelectItem>
          {values.map((item) => (
            <SelectItem key={item} value={item}>
              {optionLabel(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="grid gap-8">
      <div className="grid grid-cols-1 gap-3 border-y py-3 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.search}
            aria-label={labels.search}
            className="min-h-12 bg-background pl-11"
          />
        </div>
        {filterSelect(filters.cohort, labels.cohort, options.cohorts, "cohort")}
        {filterSelect(
          filters.country,
          labels.country,
          options.countries,
          "country",
        )}
        {filterSelect(filters.sector, labels.sector, options.sectors, "sector")}
      </div>

      {total === 0 ? (
        <p className="border border-dashed px-6 py-14 text-center text-muted-foreground">
          {filtered ? labels.empty : labels.emptyAll}
        </p>
      ) : (
        <>
          <p className="text-sm font-semibold text-muted-foreground">
            {resultLabel}
          </p>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map((startup) => (
              <li key={startup.id} className="min-w-0">
                <StartupCard
                  startup={startup}
                  locale={locale}
                  fromPage={fromPage}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
