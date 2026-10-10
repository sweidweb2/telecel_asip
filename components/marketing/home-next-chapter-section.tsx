import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
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
  { bar: "bg-asip-mint", text: "text-asip-mint" },
  {
    bar: "bg-asip-magenta",
    text: "text-[color-mix(in_oklab,var(--asip-magenta)_60%,white)]",
  },
  {
    bar: "bg-asip-coral",
    text: "text-[color-mix(in_oklab,var(--asip-coral)_55%,white)]",
  },
] as const;

/** Desktop stair-step so the three pillars read as a progression. */
const PILLAR_OFFSETS = ["", "lg:ml-6", "lg:ml-12"] as const;

/**
 * Home Module 08 — 2026 cohort / next chapter.
 *
 * The one deliberately expressive block on the home page: ink field, ASIP
 * spectrum accents, and the 2026 theme. The AI direction lives here only —
 * framed as business problem → applied AI → measurable advantage.
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
        "relative isolate scroll-mt-24 overflow-hidden bg-asip-ink text-white",
        "px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* ASIP spectrum hairline across the top edge */}
        <div className="absolute inset-x-0 top-0 flex h-1">
          <span className="flex-1 bg-brand" />
          <span className="flex-1 bg-asip-mint" />
          <span className="flex-1 bg-asip-magenta" />
          <span className="flex-1 bg-asip-coral" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl">
        {/* Mobile order: copy → pillars → CTAs. Desktop: copy + CTAs left, pillars right. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-x-16 lg:gap-y-10">
          <div data-reveal="section" className="lg:col-start-1 lg:row-start-1 lg:self-end">
            <p className="text-xs font-semibold tracking-[0.2em] text-asip-mint uppercase">
              {copy.eyebrow}
            </p>

            <div className="mt-5 inline-flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-asip-mint/60 px-4 py-1.5 font-heading text-sm font-semibold tracking-tight text-asip-mint sm:text-base">
                {copy.theme.name}
              </span>
              {copy.theme.status === "working" ? (
                <span className="rounded-full border border-dashed border-white/35 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.14em] text-white/65 uppercase">
                  {copy.theme.statusLabel}
                </span>
              ) : null}
            </div>

            <h2
              id={headingId}
              className="mt-6 max-w-xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
            >
              {copy.title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
              {copy.description}
            </p>
            <p className="mt-4 max-w-xl border-l-2 border-asip-mint pl-4 text-sm leading-6 text-white/65">
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
                    "group relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-5 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.07] sm:p-6",
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
                      <h3 className="font-heading text-lg font-semibold tracking-tight">
                        {pillar.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-white/70">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4 lg:col-start-1 lg:row-start-2 lg:self-start">
            <Link
              href={intake.href}
              className={cn(
                buttonVariants({ size: "lg" }),
                "group min-h-12 w-full rounded-full bg-asip-coral px-8 text-base text-white hover:bg-asip-coral-hover sm:w-auto",
              )}
            >
              {intake.label}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href={secondaryHref}
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "min-h-12 w-full rounded-full border-white/40 bg-white/5 px-8 text-base text-white hover:bg-white hover:text-asip-ink sm:w-auto",
              )}
            >
              {copy.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
