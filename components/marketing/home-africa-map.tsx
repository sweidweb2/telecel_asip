"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";

import type { HomeV2Copy } from "@/constants/home-v2-copy";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { cn } from "@/lib/utils";

/**
 * Schematic tile map of African markets: [ISO code, column, row].
 * Positions approximate geography; tiles are deliberately equal so no
 * market looks bigger or more active than the data supports.
 */
const TILES: [string, number, number][] = [
  ["MA", 3, 0], ["DZ", 4, 0], ["TN", 5, 0], ["LY", 6, 0], ["EG", 7, 0],
  ["CV", 0, 1], ["MR", 2, 1], ["ML", 3, 1], ["NE", 4, 1], ["TD", 5, 1], ["SD", 6, 1], ["ER", 7, 1],
  ["SN", 1, 2], ["GM", 2, 2], ["BF", 3, 2], ["NG", 4, 2], ["CF", 5, 2], ["SS", 6, 2], ["ET", 7, 2], ["DJ", 8, 2],
  ["GW", 0, 3], ["GN", 1, 3], ["SL", 2, 3], ["CI", 3, 3], ["GH", 4, 3], ["TG", 5, 3], ["BJ", 6, 3], ["UG", 7, 3], ["KE", 8, 3], ["SO", 9, 3],
  ["LR", 2, 4], ["ST", 3, 4], ["GQ", 4, 4], ["CM", 5, 4], ["CD", 6, 4], ["RW", 7, 4], ["TZ", 8, 4],
  ["GA", 4, 5], ["CG", 5, 5], ["ZM", 6, 5], ["BI", 7, 5], ["MW", 8, 5], ["KM", 9, 5], ["SC", 10, 5],
  ["AO", 5, 6], ["ZW", 6, 6], ["MZ", 7, 6], ["MG", 9, 6], ["MU", 10, 6],
  ["NA", 5, 7], ["BW", 6, 7], ["SZ", 7, 7],
  ["ZA", 6, 8], ["LS", 7, 8],
];

const COLS = 11;
const ROWS = 9;
const ACTIVE_FILLS = ["bg-asip-magenta", "bg-asip-sky", "bg-brand-mid", "bg-asip-coral"] as const;

export function HomeAfricaMap({
  locale,
  copy,
  portfolioCountries,
}: {
  locale: Locale;
  copy: HomeV2Copy["map"];
  /** ISO codes with active, published portfolio startups (verified presence). */
  portfolioCountries: string[];
}) {
  const active = useMemo(() => new Set(portfolioCountries.map((c) => c.toUpperCase())), [portfolioCountries]);
  const names = useMemo(() => new Intl.DisplayNames([locale], { type: "region" }), [locale]);
  const [selected, setSelected] = useState<string | null>(portfolioCountries[0]?.toUpperCase() ?? null);

  if (active.size === 0) return null;

  const activeList = [...active].sort((a, b) =>
    (names.of(a) ?? a).localeCompare(names.of(b) ?? b, locale),
  );
  const countryHref = (code: string) => `${publicPath(locale, "founders")}?country=${code}`;

  return (
    <section aria-labelledby="home-map-title" className="bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className="font-heading text-xs font-semibold tracking-[0.18em] text-asip-sky uppercase sm:text-sm">
            {copy.eyebrow}
          </p>
          <h2 id="home-map-title" className="mt-5 font-heading text-4xl font-semibold leading-[1.02] tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl">
            {copy.title}
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{copy.description}</p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-2">
              <span aria-hidden className="size-3 rounded-[3px] bg-asip-magenta" />
              {copy.legendPortfolio}
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <span aria-hidden className="size-3 rounded-[3px] bg-asip-ink/10" />
              {copy.legendOther}
            </span>
          </div>

          <div aria-live="polite" className="mt-8 min-h-24 rounded-2xl border p-5">
            {selected ? (
              <>
                <p className="font-heading text-2xl font-semibold">{names.of(selected) ?? selected}</p>
                <Link
                  href={countryHref(selected)}
                  className="group mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-asip-sky underline-offset-4 hover:underline"
                >
                  {copy.exploreCountry} {names.of(selected) ?? selected}
                  <ArrowUpRight aria-hidden className="size-4" />
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{copy.hint}</p>
            )}
          </div>

          <Link
            href={publicPath(locale, copy.cta.slug)}
            className="group mt-6 inline-flex items-center gap-1.5 font-heading font-semibold underline-offset-4 hover:underline"
          >
            {copy.cta.label}
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </div>

        <div className="lg:col-span-7">
          <div
            role="group"
            aria-label={copy.countriesLabel}
            className="mx-auto grid max-w-xl gap-1 sm:gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
            }}
          >
            {TILES.map(([code, col, row], index) => {
              const isActive = active.has(code);
              const isSelected = selected === code;
              const style = { gridColumn: col + 1, gridRow: row + 1 };
              const label = names.of(code) ?? code;

              if (!isActive) {
                return (
                  <span
                    key={code}
                    aria-hidden
                    title={label}
                    style={style}
                    className="aspect-square rounded-[4px] bg-asip-ink/[0.07]"
                  />
                );
              }
              return (
                <button
                  key={code}
                  type="button"
                  style={style}
                  data-active="true"
                  aria-pressed={isSelected}
                  aria-label={label}
                  onClick={() => setSelected(code)}
                  onMouseEnter={() => setSelected(code)}
                  className={cn(
                    "home-v2-node relative flex aspect-square items-center justify-center rounded-[4px] font-mono text-[0.55rem] font-semibold text-white outline-none transition-transform duration-200 hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/60 sm:text-[0.65rem] motion-reduce:transition-none",
                    ACTIVE_FILLS[index % ACTIVE_FILLS.length],
                    isSelected && "z-10 scale-110 ring-2 ring-asip-ink ring-offset-2",
                  )}
                >
                  {code}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">{copy.schematic}</p>

          {/* Plain list for screen readers and small screens. */}
          <ul className="sr-only">
            {activeList.map((code) => (
              <li key={code}>
                <a href={countryHref(code)}>{names.of(code) ?? code}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
