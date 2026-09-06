import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { StartupCard } from "@/components/marketing/startup-card";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { formatFoundedDate, startupInitials } from "@/lib/startup-display";
import type { FounderStoryPublic } from "@/types/founder-story";
import type {
  StartupPublicDetail,
  StartupPublicListItem,
} from "@/types/startup";
import { cn } from "@/lib/utils";

type StartupDetailLabels = {
  backToFounders: string;
  founders: string;
  founded: string;
  industry: string;
  category: string;
  location: string;
  team: string;
  cohort: string;
  country: string;
  sector: string;
  outcome: string;
  website: string;
  moreStartups: string;
  theProblem: string;
  whatTheyBuilt: string;
  asipConnection: string;
  whereNow: string;
  founderPerspective: string;
};

const LABELS: Record<Locale, StartupDetailLabels> = {
  en: {
    backToFounders: "Back to founders",
    founders: "Founders",
    founded: "Founded",
    industry: "Industry",
    category: "Category",
    location: "Location",
    team: "Team",
    cohort: "Cohort",
    country: "Country",
    sector: "Sector",
    outcome: "What they built next",
    website: "Visit website",
    moreStartups: "More startups",
    theProblem: "The problem",
    whatTheyBuilt: "What they built",
    asipConnection: "ASIP connection",
    whereNow: "Where they are now",
    founderPerspective: "Founder perspective",
  },
  fr: {
    backToFounders: "Retour aux fondateurs",
    founders: "Fondateurs",
    founded: "Fondée",
    industry: "Secteur",
    category: "Catégorie",
    location: "Localisation",
    team: "Équipe",
    cohort: "Cohorte",
    country: "Pays",
    sector: "Secteur",
    outcome: "La suite de leur parcours",
    website: "Visiter le site",
    moreStartups: "Autres startups",
    theProblem: "Le problème",
    whatTheyBuilt: "Ce qu’ils ont construit",
    asipConnection: "Le lien avec ASIP",
    whereNow: "Où ils en sont",
    founderPerspective: "Perspective du fondateur",
  },
};

function foundersBackHref(locale: Locale, fromPage?: number) {
  const base = publicPath(locale, "founders");
  if (fromPage !== undefined && fromPage > 1) {
    return `${base}?page=${fromPage}`;
  }
  return base;
}

function StorySection({
  title,
  children,
}: {
  title: string;
  children: string;
}) {
  return (
    <section className="mt-10 max-w-3xl border-t pt-8 sm:mt-12">
      <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>
      <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
        {children}
      </p>
    </section>
  );
}

type StartupDetailPageContentProps = {
  locale: Locale;
  startup: StartupPublicDetail;
  related: StartupPublicListItem[];
  story: FounderStoryPublic | null;
  fromPage?: number;
};

/**
 * Founder profile — identity + facts, published story modules when present,
 * related StartupCards.
 */
export function StartupDetailPageContent({
  locale,
  startup,
  related,
  story,
  fromPage,
}: StartupDetailPageContentProps) {
  const labels = LABELS[locale];
  const foundedLabel = startup.founded_at
    ? formatFoundedDate(startup.founded_at, locale)
    : null;

  const details = startup.details;
  const facts = [
    { label: labels.founded, value: foundedLabel },
    { label: labels.industry, value: details?.industry ?? null },
    { label: labels.category, value: details?.category ?? null },
    { label: labels.location, value: details?.location ?? null },
    {
      label: labels.cohort,
      value: details?.cohort ?? startup.cohort ?? null,
    },
    {
      label: labels.country,
      value: details?.country_code ?? startup.country_code ?? null,
    },
    {
      label: labels.sector,
      value: details?.sector ?? startup.sector ?? null,
    },
  ].filter((fact): fact is { label: string; value: string } =>
    Boolean(fact.value),
  );

  const team = details?.team?.trim() || null;
  const founderNames =
    details?.founder_names?.length
      ? details.founder_names
      : startup.founder_names;
  const publicOutcome =
    details?.public_outcome?.trim() || startup.public_outcome?.trim() || null;

  return (
    <main>
      <article className="pb-16 lg:pb-24">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10 lg:pt-12">
          <Link
            href={foundersBackHref(locale, fromPage)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "min-h-11 gap-2 px-0 hover:bg-transparent",
            )}
          >
            <ArrowLeft className="size-4" />
            {labels.backToFounders}
          </Link>
        </div>

        <div className="mx-auto mt-6 w-full max-w-7xl px-5 sm:mt-8 sm:px-8 lg:px-10">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-[#14333b] md:aspect-[2/1]">
            {startup.cover_image_url ? (
              <Image
                src={startup.cover_image_url}
                alt=""
                fill
                priority
                className="object-cover"
                style={{
                  objectPosition: `${startup.image_focal_x}% ${startup.image_focal_y}%`,
                }}
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
            ) : (
              <div
                aria-hidden
                className="flex size-full items-center justify-center bg-[#14333b]"
              >
                <span className="font-heading text-4xl font-semibold text-white/65 sm:text-5xl lg:text-6xl">
                  {startupInitials(startup.name)}
                </span>
              </div>
            )}
            {startup.logo_url ? (
              <div className="absolute bottom-5 left-5 size-20 overflow-hidden rounded-lg border bg-white shadow-lg sm:bottom-8 sm:left-8 sm:size-24">
                <Image
                  src={startup.logo_url}
                  alt={`${startup.name} logo`}
                  fill
                  className="object-contain p-2"
                  sizes="96px"
                />
              </div>
            ) : null}
          </div>

          <header className="mt-8 max-w-3xl sm:mt-10">
            <p className="text-sm font-semibold text-primary">
              {labels.founders}
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {startup.name}
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:mt-6 sm:text-lg">
              {startup.description}
            </p>
          </header>

          {facts.length > 0 ? (
            <dl className="mt-8 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-5 border-t pt-6 sm:mt-10 sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact.label} className="min-w-0">
                  <dt className="text-sm font-semibold text-foreground">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {team ? (
            <section className="mt-10 max-w-3xl sm:mt-12">
              <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
                {labels.team}
              </h2>
              <p className="mt-3 whitespace-pre-line text-base text-muted-foreground">
                {team}
              </p>
            </section>
          ) : null}

          {founderNames.length > 0 ? (
            <section className="mt-10 max-w-3xl border-t pt-8">
              <h2 className="font-heading text-xl font-semibold sm:text-2xl">
                {labels.founders}
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                {founderNames.join(", ")}
              </p>
            </section>
          ) : null}

          {story ? (
            <>
              <StorySection title={labels.theProblem}>
                {story.the_problem}
              </StorySection>
              <StorySection title={labels.whatTheyBuilt}>
                {story.what_they_built}
              </StorySection>
              <StorySection title={labels.asipConnection}>
                {story.the_asip_connection}
              </StorySection>
              <StorySection title={labels.whereNow}>
                {story.where_they_are_now}
              </StorySection>
              {story.quote ? (
                <section className="mt-10 max-w-3xl border-t pt-8 sm:mt-12">
                  <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
                    {labels.founderPerspective}
                  </h2>
                  <blockquote className="mt-4 space-y-3 border-l-4 border-[#dc395f] bg-muted/40 py-4 pl-5 pr-4 sm:pl-6">
                    <p className="text-base leading-relaxed text-foreground sm:text-lg">
                      “{story.quote.text}”
                    </p>
                    <footer className="text-sm text-muted-foreground">
                      — {story.quote.attribution_name}
                      {story.quote.attribution_title
                        ? `, ${story.quote.attribution_title}`
                        : null}
                    </footer>
                  </blockquote>
                </section>
              ) : null}
            </>
          ) : null}

          {publicOutcome ? (
            <section className="mt-10 max-w-3xl border-l-4 border-[#c14a9b] bg-muted/50 p-6 sm:mt-12 sm:p-8">
              <h2 className="font-heading text-2xl font-semibold">
                {labels.outcome}
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                {publicOutcome}
              </p>
            </section>
          ) : null}

          {details?.website_url ? (
            <a
              href={details.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "mt-8 inline-flex min-h-11 gap-2",
              )}
            >
              {labels.website}
              <ArrowUpRight className="size-4" />
            </a>
          ) : null}
        </div>

        {related.length > 0 ? (
          <section className="mx-auto mt-16 w-full max-w-6xl px-4 sm:mt-20 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {labels.moreStartups}
              </h2>
              <Link
                href={publicPath(locale, "founders")}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "min-h-11 shrink-0 gap-1",
                )}
              >
                {labels.backToFounders}
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
            <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <StartupCard locale={locale} startup={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </main>
  );
}
