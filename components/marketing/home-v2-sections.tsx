import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import "./home-v2.css";

import { AnimatedMetricValue } from "@/components/marketing/animated-metric-value";
import { LOGO_SPECTRUM } from "@/components/marketing/brand-accents";
import {
  CoralCtaLink,
  coralCtaOnDarkClassName,
  MarketingCtaRow,
  OutlineCtaLink,
} from "@/components/marketing/page-elements";
import type { HomeV2Copy } from "@/constants/home-v2-copy";
import type { Locale } from "@/constants/locales";
import { founderStartupPath, publicPath } from "@/constants/routes";
import { startupCoverFor } from "@/constants/startup-cover-review";
import { cohortAccent, countryDisplayName } from "@/lib/startup-display";
import type { IntakeCta } from "@/lib/marketing/intake-cta";
import { cn } from "@/lib/utils";
import type { ImpactMetricPublicItem } from "@/types/impact-metric";
import type { StartupPublicListItem } from "@/types/startup";

type CtaLike = { slug: Parameters<typeof publicPath>[1]; hash?: string };
const href = (locale: Locale, cta: CtaLike) =>
  publicPath(locale, cta.slug, cta.hash);

/** Small uppercase label; colour carries the audience or content type. */
function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "font-heading text-xs font-semibold tracking-[0.18em] uppercase sm:text-sm",
        className,
      )}
    >
      {children}
    </p>
  );
}

const headingClass =
  "font-heading font-semibold tracking-[-0.03em] text-balance leading-[1.02]";

/* -------------------------------------------------------------------------- */
/* 02 · 2026 AI Advantage                                                      */
/* -------------------------------------------------------------------------- */

const SIGNAL_COLOURS = ["bg-asip-magenta", "bg-asip-sky", "bg-brand-mid"] as const;

export function HomeAiAdvantageSection({
  locale,
  copy,
  intake,
}: {
  locale: Locale;
  copy: HomeV2Copy["ai"];
  intake: IntakeCta;
}) {
  const open = intake.slug === "apply";

  return (
    <section
      id="ai-advantage"
      aria-labelledby="home-ai-title"
      className="home-v2-grid relative scroll-mt-24 overflow-hidden bg-[#f7f5f0] px-4 py-16 text-asip-ink sm:px-6 sm:py-20 lg:px-8 lg:py-28"
    >
      <div className="relative mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-6">
          <Eyebrow className="flex items-center gap-2 text-asip-magenta">
            <span aria-hidden className="home-v2-live size-2 rounded-full bg-asip-magenta" />
            {copy.eyebrow}
          </Eyebrow>
          <h2
            id="home-ai-title"
            className={cn(headingClass, "mt-5 text-5xl sm:text-6xl lg:text-7xl")}
          >
            {copy.title}
          </h2>
          {copy.support ? (
            <p className="mt-4 font-heading text-xl font-semibold text-asip-sky sm:text-2xl">
              {copy.support}
            </p>
          ) : null}
          <p className="mt-6 max-w-xl text-lg leading-8 text-asip-ink/75">
            {copy.description}
          </p>

          <p
            className="mt-6 flex max-w-xl items-start gap-3 border-l-4 border-asip-sun pl-4 text-sm leading-6 text-asip-ink/80"
            role="status"
          >
            {open ? copy.statusOpen : copy.statusClosed}
          </p>

          <MarketingCtaRow className="mt-8 gap-3.5 sm:flex-wrap">
            <CoralCtaLink href={href(locale, copy.founderCta)} className="group min-h-12">
              {copy.founderCta.label}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </CoralCtaLink>
            <OutlineCtaLink href={href(locale, copy.investorCta)} className="min-h-12 border-asip-ink/25">
              {copy.investorCta.label}
            </OutlineCtaLink>
          </MarketingCtaRow>
        </div>

        {/* Real founder photo with a restrained system/data layer on top. */}
        <div className="relative lg:col-span-6">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src="/images/ASIP-110.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
              style={{ objectPosition: "center 40%" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--asip-ink)_92%,transparent)_0%,color-mix(in_srgb,var(--asip-ink)_40%,transparent)_55%,transparent_100%)]" />

            <div
              aria-label={copy.panelLabel}
              className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/15 bg-asip-ink/80 p-5 text-white backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-6"
            >
              <p className="font-mono text-[0.7rem] tracking-[0.16em] text-white/55 uppercase">
                {copy.panelLabel}
              </p>
              <ul className="mt-4 space-y-4">
                {copy.signals.map((signal, index) => (
                  <li key={signal.id}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-heading text-base font-semibold">{signal.label}</span>
                      <span className="hidden text-right text-xs text-white/60 sm:block">
                        {signal.detail}
                      </span>
                    </div>
                    <span aria-hidden className="mt-2 block h-1 overflow-hidden rounded-full bg-white/10">
                      <span
                        className={cn("home-v2-trace block h-full rounded-full", SIGNAL_COLOURS[index % 3])}
                        style={{ animationDelay: `${index * 180}ms` }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 03 · Proof strip — verified CMS metrics only, max 4, no sentence           */
/* -------------------------------------------------------------------------- */

type ProofMetric = Pick<ImpactMetricPublicItem, "id" | "claim_label" | "value" | "unit">;

const PROOF_RULES = ["bg-asip-magenta", "bg-asip-sky", "bg-brand-mid", "bg-asip-sun"] as const;

export function HomeProofStrip({
  copy,
  metrics,
}: {
  copy: HomeV2Copy["proof"];
  metrics: ProofMetric[];
}) {
  const shown = metrics.slice(0, 4);
  // Uncleared metrics are removed, never replaced with filler.
  if (shown.length === 0) return null;

  return (
    <section aria-label={copy.label} className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <dl
        className={cn(
          "mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-6 gap-y-10",
          shown.length >= 3 ? "lg:grid-cols-4" : "lg:grid-cols-2",
        )}
      >
        {shown.map((metric, index) => (
          <div key={metric.id} className="flex flex-col-reverse gap-2">
            <dt className="text-sm leading-5 text-muted-foreground sm:text-base">
              {metric.claim_label}
            </dt>
            <dd className="font-heading text-5xl font-semibold tracking-[-0.04em] text-asip-ink sm:text-6xl lg:text-7xl">
              <span aria-hidden className={cn("mb-4 block h-1.5 w-10 rounded-full", PROOF_RULES[index])} />
              <AnimatedMetricValue value={metric.value} />
              {metric.unit ? <span>{metric.unit}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 04 + 05 · Founder / Investor pathways (split screen, anchored)             */
/* -------------------------------------------------------------------------- */

export type PortfolioStats = { companies: number; markets: number; sectors: number };

export function HomePathwaysSection({
  locale,
  founder,
  investor,
  intake,
  stats = null,
}: {
  locale: Locale;
  founder: HomeV2Copy["founder"] | null;
  investor: HomeV2Copy["investor"] | null;
  intake: IntakeCta;
  /** Live counts from the published portfolio; hidden when unavailable. */
  stats?: PortfolioStats | null;
}) {
  const statItems =
    stats && investor
      ? [
          { value: stats.companies, label: investor.statLabels.companies },
          { value: stats.markets, label: investor.statLabels.markets },
          // Sectors are not counted: CMS sector values mix combined tags.
        ].filter((item) => item.value > 0)
      : [];

  const columns = Number(Boolean(founder)) + Number(Boolean(investor));

  return (
    <div
      className={cn(
        "grid",
        columns > 1 ? "lg:grid-cols-2" : "lg:grid-cols-1",
      )}
    >
      {founder ? (
        <section
          id="founders"
          aria-labelledby="home-founder-title"
          className="home-v2-pathway scroll-mt-20 bg-asip-sun px-4 py-16 text-asip-ink sm:px-6 sm:py-20 lg:px-12 lg:py-24 xl:pl-[max(3rem,calc((100vw-80rem)/2+2rem))]"
        >
          <Eyebrow>{founder.eyebrow}</Eyebrow>
          <h2
            id="home-founder-title"
            className={cn(headingClass, "mt-5 text-5xl sm:text-6xl")}
          >
            {founder.title}
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-asip-ink/80">
            {founder.description}
          </p>

          <ol className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2 font-heading text-sm font-semibold">
            {founder.steps.map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                <span className="rounded-full bg-asip-ink/[0.08] px-3 py-1.5">
                  {step}
                </span>
                {index < founder.steps.length - 1 ? (
                  <ArrowRight
                    aria-hidden
                    className="size-3.5 text-asip-ink/45"
                  />
                ) : null}
              </li>
            ))}
          </ol>

          <MarketingCtaRow className="mt-10 gap-3.5 sm:flex-wrap">
            <CoralCtaLink
              href={href(locale, founder.cta)}
              className="group min-h-12"
            >
              {founder.cta.label}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </CoralCtaLink>
            <OutlineCtaLink
              href={intake.href}
              className="min-h-12 border-asip-ink/30 bg-transparent"
            >
              {intake.label}
            </OutlineCtaLink>
          </MarketingCtaRow>
        </section>
      ) : null}

      {investor ? (
        <section
          id="investors"
          aria-labelledby="home-investor-title"
          className="home-v2-pathway scroll-mt-20 bg-asip-ink px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-12 lg:py-24 xl:pr-[max(3rem,calc((100vw-80rem)/2+2rem))]"
        >
          <div
            className={cn(
              "grid gap-10",
              // Solo pathway: fill the empty right with proof, not max-w-lg leftovers.
              columns === 1 &&
                "mx-auto w-full max-w-6xl lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:gap-x-14 lg:gap-y-12",
            )}
          >
            <div className="min-w-0">
              <Eyebrow className="text-asip-mint">{investor.eyebrow}</Eyebrow>
              <h2
                id="home-investor-title"
                className={cn(headingClass, "mt-5 text-5xl sm:text-6xl")}
              >
                {investor.title}
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
                {investor.description}
              </p>

              <MarketingCtaRow className="mt-10 gap-3.5 sm:flex-wrap">
                <CoralCtaLink
                  href={href(locale, investor.primaryCta)}
                  className={cn("group min-h-12", coralCtaOnDarkClassName)}
                >
                  {investor.primaryCta.label}
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </CoralCtaLink>
                <OutlineCtaLink
                  href={intake.href}
                  className="min-h-12 border-white/40 bg-transparent text-white hover:bg-white hover:text-asip-ink"
                >
                  {intake.label}
                </OutlineCtaLink>
              </MarketingCtaRow>
            </div>

            <div className="min-w-0 space-y-6">
              {statItems.length > 0 ? (
                <dl
                  className={cn(
                    "grid grid-cols-2 gap-4 border-t border-white/15 pt-6",
                    columns === 1 && "lg:border-t-0 lg:pt-0",
                  )}
                >
                  {statItems.map((item) => (
                    <div key={item.label} className="flex flex-col-reverse gap-1">
                      <dt className="text-xs leading-5 text-white/60 sm:text-sm">
                        {item.label}
                      </dt>
                      <dd className="font-heading text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
                        <AnimatedMetricValue value={String(item.value)} />
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/15 sm:grid-cols-2">
                {investor.questions.map((question, index) => (
                  <li
                    key={question}
                    className="flex items-center gap-3 bg-asip-ink px-4 py-4 text-sm font-semibold"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        LOGO_SPECTRUM[index + 1],
                      )}
                    />
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 06 · Founder stories — featured portfolio, varied card scale               */
/* -------------------------------------------------------------------------- */

/** Text Pack v2: a card carries one idea. Keep the first sentence, max 20 words. */
export function oneLineProposition(description: string, maxWords = 20): string {
  const first = description.trim().split(/(?<=[.!?])\s+/)[0] ?? "";
  const words = first.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return first;
  return `${words.slice(0, maxWords).join(" ").replace(/[,;:]$/, "")}…`;
}

function HomeStoryCard({
  startup,
  locale,
  lead = false,
}: {
  startup: StartupPublicListItem;
  locale: Locale;
  lead?: boolean;
}) {
  const cover = startupCoverFor(startup);
  const accent = cohortAccent(startup.cohort);
  const tags = [
    countryDisplayName(startup.country_code, locale),
    startup.sector,
    startup.cohort,
  ].filter(Boolean);

  return (
    <Link
      href={founderStartupPath(locale, startup.slug, 1)}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#f7f5f0] outline-none transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_color-mix(in_srgb,var(--asip-ink)_55%,transparent)] focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
        lead && "md:col-span-2 lg:col-span-2",
        // Only a real photo earns the tall two-row slot.
        lead && cover && "lg:row-span-2",
      )}
    >
      {cover ? (
        <div className={cn("relative w-full overflow-hidden", lead ? "aspect-[16/10] lg:flex-1" : "aspect-[16/9]")}>
          <Image
            src={cover}
            alt=""
            fill
            sizes={lead ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, 100vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
            style={{ objectPosition: `${startup.image_focal_x}% ${startup.image_focal_y}%` }}
          />
        </div>
      ) : (
        <span aria-hidden className={cn("block h-1.5 w-full", accent.bar)} />
      )}
      <div className={cn("flex flex-1 flex-col gap-3 p-6", lead && "sm:p-8")}>
        <p className="text-xs font-semibold tracking-[0.12em] text-asip-ink/55 uppercase">
          {tags.join(" · ")}
        </p>
        <h3 className={cn("font-heading font-semibold tracking-tight text-asip-ink", lead ? "text-3xl sm:text-4xl" : "text-2xl")}>
          {startup.name}
        </h3>
        <p className={cn("leading-7 text-asip-ink/75", lead ? "text-lg" : "text-base")}>
          {oneLineProposition(startup.description)}
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 font-heading text-sm font-semibold text-asip-ink">
          {startup.founder_names.length > 0 ? startup.founder_names.join(", ") : startup.name}
          <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function HomeFounderStoriesSection({
  locale,
  copy,
  startups,
}: {
  locale: Locale;
  copy: HomeV2Copy["stories"];
  startups: StartupPublicListItem[];
}) {
  if (startups.length === 0) return null;
  // Real imagery first: founders are the visual heroes.
  const ordered = [...startups].sort(
    (a, b) => Number(Boolean(startupCoverFor(b))) - Number(Boolean(startupCoverFor(a))),
  );
  // Photo lead fills two rows beside two cards; a text lead (2 cols) needs
  // four more cards to complete the 3-column grid without a gap.
  const leadHasCover = Boolean(ordered[0] && startupCoverFor(ordered[0]));
  const [lead, ...rest] = ordered.slice(0, leadHasCover ? 3 : 5);

  return (
    <section aria-labelledby="home-stories-title" className="bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow className="text-asip-magenta">{copy.eyebrow}</Eyebrow>
            <h2 id="home-stories-title" className={cn(headingClass, "mt-5 text-4xl sm:text-5xl lg:text-6xl")}>
              {copy.title}
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-lg leading-8 text-muted-foreground">{copy.description}</p>
            <Link
              href={href(locale, copy.cta)}
              className="group mt-4 inline-flex items-center gap-1.5 font-heading font-semibold text-asip-ink underline-offset-4 hover:underline"
            >
              {copy.cta.label}
              <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div
          className={cn(
            "mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3",
            leadHasCover && "lg:grid-rows-2",
          )}
        >
          {lead ? <HomeStoryCard startup={lead} locale={locale} lead /> : null}
          {rest.map((startup) => (
            <HomeStoryCard key={startup.id} startup={startup} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 07 · Impact — editorial line, no tiles (numbers live in the proof strip)    */
/* -------------------------------------------------------------------------- */

export function HomeImpactBand({ locale, copy }: { locale: Locale; copy: HomeV2Copy["impact"] }) {
  return (
    <section aria-labelledby="home-impact-title" className="border-t border-border bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Eyebrow className="text-brand-mid">{copy.eyebrow}</Eyebrow>
          <h2 id="home-impact-title" className={cn(headingClass, "mt-5 text-4xl sm:text-5xl lg:text-6xl")}>
            {copy.title}
          </h2>
        </div>
        <div className="lg:col-span-4">
          <p className="text-lg leading-8 text-muted-foreground">{copy.description}</p>
          <OutlineCtaLink href={href(locale, copy.cta)} className="mt-6 min-h-12">
            {copy.cta.label}
          </OutlineCtaLink>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 09 · Ecosystem — contribution before logos                                 */
/* -------------------------------------------------------------------------- */

const VALUE_COLOURS = ["text-asip-sky", "text-asip-magenta", "text-brand-mid", "text-asip-coral", "text-[#b89a00]"] as const;

export function HomeEcosystemValueSection({ locale, copy }: { locale: Locale; copy: HomeV2Copy["ecosystem"] }) {
  return (
    <section aria-labelledby="home-ecosystem-title" className="bg-[#f7f5f0] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-3xl">
          <Eyebrow className="text-asip-sky">{copy.eyebrow}</Eyebrow>
          <h2 id="home-ecosystem-title" className={cn(headingClass, "mt-5 text-4xl sm:text-5xl lg:text-6xl")}>
            {copy.title}
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-asip-ink/75">{copy.description}</p>
        </div>

        <ol className="mt-12 divide-y divide-asip-ink/10 border-y border-asip-ink/10">
          {copy.values.map((value, index) => (
            <li
              key={value.id}
              className="group grid gap-2 py-6 transition-colors sm:grid-cols-12 sm:items-baseline sm:gap-6"
            >
              <span className={cn("font-mono text-sm sm:col-span-1", VALUE_COLOURS[index % 5])}>
                0{index + 1}
              </span>
              <span className="font-heading text-2xl font-semibold tracking-tight sm:col-span-4 sm:text-3xl">
                {value.title}
              </span>
              <span className="text-base leading-7 text-asip-ink/70 sm:col-span-7">{value.description}</span>
            </li>
          ))}
        </ol>

        <OutlineCtaLink href={href(locale, copy.cta)} className="mt-10 min-h-12 border-asip-ink/25">
          {copy.cta.label}
        </OutlineCtaLink>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 11 · Closing conversion — status-led                                       */
/* -------------------------------------------------------------------------- */

export function HomeClosingSection({
  locale,
  copy,
  intake,
}: {
  locale: Locale;
  copy: HomeV2Copy["closing"];
  intake: IntakeCta;
}) {
  return (
    <section aria-labelledby="home-closing-title" className="relative overflow-hidden bg-asip-ink px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      <span aria-hidden className="absolute inset-x-0 top-0 flex h-1.5">
        {LOGO_SPECTRUM.map((colour) => (
          <span key={colour} className={cn("flex-1", colour)} />
        ))}
      </span>
      <div className="mx-auto w-full max-w-7xl">
        <Eyebrow className="text-asip-mint">{copy.eyebrow}</Eyebrow>
        <h2 id="home-closing-title" className={cn(headingClass, "mt-5 max-w-4xl text-5xl sm:text-6xl lg:text-7xl")}>
          {copy.title}
        </h2>
        <p className="mt-6 text-xl text-white/70">{copy.description}</p>
        <MarketingCtaRow className="mt-10 gap-3.5 sm:flex-wrap">
          <CoralCtaLink href={intake.href} className={cn("group min-h-14 px-9 text-lg", coralCtaOnDarkClassName)}>
            {intake.label}
            <ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-0.5" />
          </CoralCtaLink>
          <OutlineCtaLink
            href={href(locale, copy.investorCta)}
            className="min-h-14 border-white/45 bg-transparent px-9 text-lg text-white hover:bg-white hover:text-asip-ink"
          >
            {copy.investorCta.label}
          </OutlineCtaLink>
        </MarketingCtaRow>
      </div>
    </section>
  );
}
