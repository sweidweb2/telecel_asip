import { ArrowRight } from "lucide-react";

import {
  CoralCtaLink,
  MarketingCtaRow,
  OutlineCtaLink,
  SectionEyebrow,
} from "@/components/marketing/page-elements";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { IntakeCta } from "@/lib/marketing/intake-cta";
import { cn } from "@/lib/utils";
import type { HomePageCopy } from "@/types/marketing-page";

type HomeNextChapterSectionProps = {
  locale: Locale;
  copy: HomePageCopy["nextChapter"];
  intake: IntakeCta;
  className?: string;
};

/** Pillar accents walk the ASIP spectrum: mint → magenta → coral. */
const PILLAR_ACCENTS = [
  {
    bar: "bg-asip-mint",
    text: "text-[color-mix(in_oklab,var(--asip-mint)_45%,var(--asip-ink))]",
  },
  { bar: "bg-asip-magenta", text: "text-asip-magenta" },
  { bar: "bg-asip-coral", text: "text-asip-coral" },
] as const;

/** Desktop stair-step so the three pillars read as a progression. */
const PILLAR_OFFSETS = ["", "lg:ml-6", "lg:ml-12"] as const;

/**
 * Home Module 08 — 2026 cohort / next chapter.
 *
 * Light expressive block: ASIP spectrum accents and the 2026 theme.
 * The AI direction lives here only — framed as business problem →
 * applied AI → measurable advantage.
 * `copy.theme.status === "working"` shows a tag until the theme is locked.
 */
export function HomeNextChapterSection({
  locale,
  copy,
  intake,
  className,
}: HomeNextChapterSectionProps) {
  const secondaryHref = publicPath(locale, copy.secondaryCta.slug);
  const headingId = "home-next-chapter-heading";

  return (
    <section
      id="next-chapter"
      aria-labelledby={headingId}
      className={cn(
        "home-module-seam-to relative isolate scroll-mt-24 overflow-hidden border-b border-border text-foreground",
        "px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24",
        className,
      )}
    >
      {/* Seam orb — mirrors Telecel’s bottom-left dust so the join stays continuous */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-[8%] size-40 rounded-full bg-brand/10 blur-3xl sm:size-56" />
      </div>

      <div className="mx-auto w-full max-w-6xl">
        {/* Mobile order: copy → pillars → CTAs. Desktop: copy + CTAs left, pillars right. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-x-16 lg:gap-y-10">
          <div data-reveal="section" className="lg:col-start-1 lg:row-start-1 lg:self-end">
            <SectionEyebrow>{copy.eyebrow}</SectionEyebrow>

            <div className="mt-5 inline-flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-brand/40 bg-brand-subtle px-4 py-1.5 font-heading text-sm font-semibold tracking-tight text-brand sm:text-base">
                {copy.theme.name}
              </span>
              {copy.theme.status === "working" ? (
                <span className="rounded-full border border-dashed border-foreground/25 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  {copy.theme.statusLabel}
                </span>
              ) : null}
            </div>

            <h2
              id={headingId}
              className="mt-6 max-w-xl font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl"
            >
              {copy.title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {copy.description}
            </p>
            <p className="mt-4 max-w-xl border-l-2 border-brand pl-4 text-sm leading-6 text-muted-foreground">
              {copy.theme.summary}
            </p>

          </div>

          <ol className="relative grid gap-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            {copy.pillars.map((pillar, index) => {
              const accent = PILLAR_ACCENTS[index % PILLAR_ACCENTS.length]!;
              return (
                <li
                  key={pillar.id}
                  data-reveal="section"
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors duration-300 hover:border-foreground/20 hover:bg-muted/40 sm:p-6",
                    PILLAR_OFFSETS[index % PILLAR_OFFSETS.length],
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0 left-0 w-1 origin-top transition-transform duration-500 group-hover:scale-y-100 sm:scale-y-75",
                      accent.bar,
                    )}
                  />
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden
                      className={cn(
                        "font-heading text-2xl font-semibold tabular-nums",
                        accent.text,
                      )}
                    >
                      {pillar.label}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                        {pillar.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <MarketingCtaRow className="lg:col-start-1 lg:row-start-2 lg:self-start">
            <CoralCtaLink
              href={intake.href}
              className="group min-h-12 text-base"
            >
              {intake.label}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </CoralCtaLink>
            <OutlineCtaLink
              href={secondaryHref}
              className="min-h-12 border-foreground/25 bg-background text-base text-foreground hover:bg-muted"
            >
              {copy.secondaryCta.label}
            </OutlineCtaLink>
          </MarketingCtaRow>
        </div>
      </div>
    </section>
  );
}
