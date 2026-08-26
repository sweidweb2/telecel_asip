import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { PageHero, Section } from "@/components/marketing/page-elements";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { formatFoundedDate, startupInitials } from "@/lib/startup-display";
import type { StartupPublicDetail } from "@/types/startup";
import { cn } from "@/lib/utils";

type StartupDetailPageContentProps = {
  locale: Locale;
  startup: StartupPublicDetail;
  fromPage?: number;
};

const LABELS = {
  en: {
    back: "Back to portfolio",
    founded: "Founded",
    website: "Visit website",
    industry: "Industry",
    category: "Category",
    location: "Location",
    foundingYear: "Founding year",
    size: "Company size",
    team: "Team",
    problem: "Problem",
    solution: "Solution",
    targetMarket: "Target market",
    businessModel: "Business model",
    fundingGoal: "Funding goal",
    amountRaised: "Amount raised",
  },
  fr: {
    back: "Retour au portefeuille",
    founded: "Fondée",
    website: "Visiter le site",
    industry: "Industrie",
    category: "Catégorie",
    location: "Localisation",
    foundingYear: "Année de fondation",
    size: "Taille",
    team: "Équipe",
    problem: "Problème",
    solution: "Solution",
    targetMarket: "Marché cible",
    businessModel: "Modèle économique",
    fundingGoal: "Objectif de financement",
    amountRaised: "Montant levé",
  },
} as const;

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function portfolioBackHref(locale: Locale, fromPage?: number) {
  const base = publicPath(locale, "portfolio");
  if (fromPage !== undefined && fromPage > 1) {
    return `${base}?page=${fromPage}`;
  }
  return base;
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <div className="space-y-2">
      <h2 className="font-heading text-lg font-semibold tracking-tight">
        {title}
      </h2>
      <p className="leading-7 text-muted-foreground text-pretty whitespace-pre-wrap">
        {children}
      </p>
    </div>
  );
}

export function StartupDetailPageContent({
  locale,
  startup,
  fromPage,
}: StartupDetailPageContentProps) {
  const labels = LABELS[locale];
  const details = startup.details;
  const foundedLabel = startup.founded_at
    ? formatFoundedDate(startup.founded_at)
    : null;

  const metaItems = [
    details?.industry
      ? { label: labels.industry, value: details.industry }
      : null,
    details?.category
      ? { label: labels.category, value: details.category }
      : null,
    details?.location
      ? { label: labels.location, value: details.location }
      : null,
    details?.founding_year
      ? { label: labels.foundingYear, value: String(details.founding_year) }
      : null,
    details?.size ? { label: labels.size, value: details.size } : null,
    foundedLabel ? { label: labels.founded, value: foundedLabel } : null,
    formatMoney(details?.funding_goal)
      ? {
          label: labels.fundingGoal,
          value: formatMoney(details?.funding_goal)!,
        }
      : null,
    formatMoney(details?.amount_raised)
      ? {
          label: labels.amountRaised,
          value: formatMoney(details?.amount_raised)!,
        }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <main>
      <div className="border-b bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
          <Link
            href={portfolioBackHref(locale, fromPage)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "min-h-11 gap-2 px-0 hover:bg-transparent",
            )}
          >
            <ArrowLeft className="size-4" />
            {labels.back}
          </Link>
        </div>
      </div>

      <PageHero title={startup.name} description={startup.description} />

      <Section className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-12">
        <div className="space-y-8">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-muted">
            {startup.logo_url ? (
              <Image
                src={startup.logo_url}
                alt={startup.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            ) : (
              <div
                aria-hidden
                className="flex size-full items-center justify-center bg-gradient-to-br from-primary/15 via-muted to-primary/5"
              >
                <span className="font-heading text-4xl font-semibold tracking-tight text-primary/50 sm:text-5xl">
                  {startupInitials(startup.name)}
                </span>
              </div>
            )}
          </div>

          <DetailBlock title={labels.problem}>{details?.problem}</DetailBlock>
          <DetailBlock title={labels.solution}>{details?.solution}</DetailBlock>
          <DetailBlock title={labels.targetMarket}>
            {details?.target_market}
          </DetailBlock>
          <DetailBlock title={labels.businessModel}>
            {details?.business_model}
          </DetailBlock>
          <DetailBlock title={labels.team}>{details?.team}</DetailBlock>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {metaItems.length > 0 ? (
            <dl className="space-y-4 rounded-2xl border bg-card p-5 sm:p-6">
              {metaItems.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium sm:text-base">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {details?.website_url ? (
            <a
              href={details.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants(),
                "inline-flex min-h-11 w-full gap-2",
              )}
            >
              {labels.website}
              <ExternalLink className="size-4" />
            </a>
          ) : null}
        </aside>
      </Section>
    </main>
  );
}
