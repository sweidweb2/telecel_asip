"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { partnerLabelsFor } from "@/components/marketing/partner-labels";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Locale } from "@/constants/locales";
import type { PartnerPublicItem, PartnerType } from "@/types/partner";
import type { PartnersPageCopy } from "@/types/marketing-page";
import { cn } from "@/lib/utils";

type TypeLabels = Partial<Record<PartnerType, string>>;

const ALL_FILTER = "all";
/** Visible letters before ellipsis on name-only (no logo) tiles. */
const NAME_CARD_MAX_CHARS = 15;

type FilterId = typeof ALL_FILTER | PartnerType | "other";

const FLOAT_PHASE = [
  "next-chapter-float",
  "next-chapter-float-delayed",
  "about-story-float",
  "about-story-float-delayed",
  "honeycomb-float",
  "honeycomb-float-delayed",
] as const;

/** Shell footprint in rem — sized to logo tiles + float travel (~8px). */
const TILE_W = 10.25;
const TILE_H = 4.1;
const GAP_X = 1.35;
const GAP_Y = 1.15;
/** Tight edge insets — just enough that float motion does not clip. */
const PAD_X = 0.4;
const PAD_Y = 0.55;

export type FloatSlot = {
  left: string;
  top: string;
  scale: number;
  /** Center in rem — used by tests for overlap checks. */
  cx: number;
  cy: number;
};

export type FloatFieldLayout = {
  slots: FloatSlot[];
  widthRem: number;
  heightRem: number;
};

function preferColumns(count: number): number {
  if (count <= 1) return 1;
  if (count <= 3) return count;
  if (count <= 6) return 3;
  if (count <= 10) return 4;
  if (count <= 14) return 5;
  return 6;
}

/**
 * Non-overlapping floating field: jittered grid cells so logos never intersect,
 * then vertical bounds are normalized so top/bottom padding match.
 */
export function layoutFloatField(total: number): FloatFieldLayout {
  const count = Math.max(total, 0);
  if (count === 0) {
    return { slots: [], widthRem: TILE_W, heightRem: TILE_H };
  }

  const cols = preferColumns(count);
  const rows = Math.ceil(count / cols);
  const widthRem = cols * TILE_W + (cols - 1) * GAP_X + PAD_X * 2;

  const raw: { cx: number; cy: number; scale: number }[] = [];

  for (let index = 0; index < count; index += 1) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const itemsInRow = row === rows - 1 ? count - row * cols : cols;
    const rowOffset = ((cols - itemsInRow) * (TILE_W + GAP_X)) / 2;

    // Jitter stays inside the free gap so neighbour AABBs cannot meet.
    const maxJitterX = GAP_X * 0.35;
    const maxJitterY = GAP_Y * 0.3;
    const jitterX =
      ((((index * 47) % 100) / 100) * 2 - 1) * maxJitterX;
    const jitterY =
      ((((index * 91) % 100) / 100) * 2 - 1) * maxJitterY;

    const cx =
      PAD_X + rowOffset + col * (TILE_W + GAP_X) + TILE_W / 2 + jitterX;
    const cy = row * (TILE_H + GAP_Y) + TILE_H / 2 + jitterY;
    const scale = 0.92 + ((index * 17) % 4) * 0.035;

    raw.push({ cx, cy, scale });
  }

  const contentTop = Math.min(...raw.map((slot) => slot.cy - TILE_H / 2));
  const contentBottom = Math.max(...raw.map((slot) => slot.cy + TILE_H / 2));
  const contentHeight = contentBottom - contentTop;
  const heightRem = contentHeight + PAD_Y * 2;

  const slots: FloatSlot[] = raw.map((slot) => {
    const cy = PAD_Y + (slot.cy - contentTop);
    return {
      left: `${(slot.cx / widthRem) * 100}%`,
      top: `${(cy / heightRem) * 100}%`,
      scale: slot.scale,
      cx: slot.cx,
      cy,
    };
  });

  return { slots, widthRem, heightRem };
}

/** Half-extents used for overlap tests (matches TILE_*). */
export const FLOAT_TILE_HALF = {
  w: TILE_W / 2,
  h: TILE_H / 2,
} as const;

/** Truncate partner display name for no-logo cards (15 chars + …). */
export function truncatePartnerCardName(
  name: string,
  maxChars = NAME_CARD_MAX_CHARS,
): string {
  const trimmed = name.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars)}...`;
}

function PartnerMark({ partner }: { partner: PartnerPublicItem }) {
  const label = partner.org ? `${partner.name} - ${partner.org}` : partner.name;

  if (partner.logo_url) {
    return (
      <Image
        src={partner.logo_url}
        alt={`${label} logo`}
        width={200}
        height={64}
        sizes="(max-width: 768px) 40vw, 160px"
        className="h-auto max-h-8 w-auto max-w-[7.5rem] object-contain sm:max-h-10 sm:max-w-[9rem]"
      />
    );
  }

  const shortName = truncatePartnerCardName(partner.name);

  return (
    <span
      title={partner.name}
      className="max-w-[7.5rem] truncate px-0.5 text-center text-xs font-semibold tracking-tight text-foreground sm:max-w-[9rem] sm:text-sm"
    >
      {shortName}
    </span>
  );
}

function PartnerShell({
  partner,
  className,
}: {
  partner: PartnerPublicItem;
  className?: string;
}) {
  const label = partner.org ? `${partner.name} - ${partner.org}` : partner.name;

  const shell = (
    <span
      className={cn(
        "flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-border/60 bg-background/90 px-3 py-2 shadow-[0_12px_32px_-18px_rgba(20,51,59,0.5)] backdrop-blur-md",
        "transition-[transform,box-shadow] duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-16px_rgba(20,51,59,0.55)]",
        className,
      )}
    >
      <PartnerMark partner={partner} />
    </span>
  );

  if (!partner.link) return shell;

  return (
    <a
      href={partner.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {shell}
    </a>
  );
}

function PartnerFloatTile({
  partner,
  slot,
  phase,
}: {
  partner: PartnerPublicItem;
  slot: FloatSlot;
  phase: (typeof FLOAT_PHASE)[number];
}) {
  return (
    <li
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: slot.left, top: slot.top }}
    >
      <div className={phase}>
        <div style={{ transform: `scale(${slot.scale})` }}>
          <PartnerShell partner={partner} />
        </div>
      </div>
    </li>
  );
}

type PartnersNetworkProps = {
  locale: Locale;
  partners: PartnerPublicItem[];
  typeRows: PartnersPageCopy["types"]["rows"];
  className?: string;
};

/**
 * Partner logos in a floating field, filtered by type tabs (default: All).
 * Mobile uses a calm 2-col grid — the float canvas only fits from md up.
 */
export function PartnersNetwork({
  locale,
  partners,
  typeRows,
  className,
}: PartnersNetworkProps) {
  const labels = partnerLabelsFor(locale);
  const [filter, setFilter] = useState<FilterId>(ALL_FILTER);

  const typeLabels: TypeLabels = useMemo(
    () => Object.fromEntries(typeRows.map((row) => [row.id, row.type])),
    [typeRows],
  );
  const order = useMemo(() => typeRows.map((row) => row.id), [typeRows]);
  const known = useMemo(() => new Set(order), [order]);

  const tabs = useMemo(() => {
    const present = new Set(partners.map((partner) => partner.type));
    const items: { id: FilterId; label: string }[] = [
      { id: ALL_FILTER, label: labels.allFilter },
    ];

    for (const type of order) {
      if (!present.has(type)) continue;
      items.push({ id: type, label: typeLabels[type] ?? type });
    }

    const hasOther = partners.some((partner) => !known.has(partner.type));
    if (hasOther) {
      items.push({ id: "other", label: labels.otherTitle });
    }

    return items;
  }, [partners, order, known, typeLabels, labels.allFilter, labels.otherTitle]);

  const filtered = useMemo(() => {
    if (filter === ALL_FILTER) return partners;
    if (filter === "other") {
      return partners.filter((partner) => !known.has(partner.type));
    }
    return partners.filter((partner) => partner.type === filter);
  }, [partners, filter, known]);

  const field = useMemo(
    () => layoutFloatField(filtered.length),
    [filtered.length],
  );

  if (partners.length === 0) {
    return (
      <p className={cn("text-center text-muted-foreground", className)}>
        {labels.emptyState}
      </p>
    );
  }

  return (
    <div className={cn("mx-auto w-full max-w-6xl", className)}>
      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as FilterId)}
        className="min-w-0 w-full items-stretch"
      >
        <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList
            variant="default"
            className="mx-auto flex h-auto w-max max-w-none flex-nowrap justify-start gap-1 p-1 group-data-horizontal/tabs:h-auto md:mx-auto md:justify-center"
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="h-9 shrink-0 flex-none px-3 after:hidden sm:px-3.5"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {filtered.length === 0 ? (
        <p className="mt-4 text-center text-muted-foreground">
          {labels.emptyFilterState}
        </p>
      ) : (
        <>
          {/* Mobile: orderly grid — float percentages collide on narrow viewports */}
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:hidden">
            {filtered.map((partner) => (
              <li key={partner.id} className="flex min-w-0 justify-center">
                <PartnerShell
                  partner={partner}
                  className="w-full max-w-[11rem]"
                />
              </li>
            ))}
          </ul>

          {/* Desktop: floating field */}
          <div
            className="relative mt-4 hidden w-full overflow-visible md:block"
            style={{ height: `${field.heightRem}rem` }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute top-[8%] left-[8%] size-28 rounded-full bg-brand/10 blur-3xl sm:size-40" />
              <div className="absolute right-[8%] bottom-[6%] size-32 rounded-full bg-[color-mix(in_oklab,var(--asip-magenta)_10%,transparent)] blur-3xl sm:size-44" />
            </div>

            <ul className="absolute inset-0">
              {filtered.map((partner, index) => (
                <PartnerFloatTile
                  key={partner.id}
                  partner={partner}
                  slot={field.slots[index]!}
                  phase={FLOAT_PHASE[index % FLOAT_PHASE.length]!}
                />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
