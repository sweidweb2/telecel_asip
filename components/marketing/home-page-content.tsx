import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Compass,
  Cpu,
  Globe,
  GraduationCap,
  Hammer,
  Handshake,
  Landmark,
  Network,
  TrendingUp,
  Waypoints,
  type LucideIcon,
} from "lucide-react";

import { TELECEL_GROUP_URL } from "@/components/layout/site-footer-labels";
import { BlogCard } from "@/components/marketing/blog-card";
import { HomeHero } from "@/components/marketing/home-hero";
import {
  Section,
  SectionHeading,
} from "@/components/marketing/page-elements";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { founderStartupPath, publicPath } from "@/constants/routes";
import { localeUrl } from "@/lib/seo/alternates";
import { startupInitials } from "@/lib/startup-display";
import { cn } from "@/lib/utils";
import type { ArticleListItem } from "@/types/article";
import type {
  HomePageCopy,
  HomePageLink,
  HomePartnerRoleId,
  HomePlatformStepId,
} from "@/types/marketing-page";
import type { StartupPublicListItem } from "@/types/startup";

const STEP_ICONS: Record<HomePlatformStepId, LucideIcon> = {
  discover: Compass,
  build: Hammer,
  connect: Waypoints,
  commercialise: Handshake,
  scale: TrendingUp,
};

const ROLE_ICONS: Record<HomePartnerRoleId, LucideIcon> = {
  mentors: GraduationCap,
  investors: Landmark,
  corporates: Building2,
  technology: Cpu,
  institutions: Globe,
  ecosystem: Network,
};

const SPOTLIGHT_LIMIT = 5;
const OUTCOME_LIMIT = 3;

type HomePageContentProps = {
  locale: Locale;
  copy: HomePageCopy;
  founders: StartupPublicListItem[];
  articles: ArticleListItem[];
};

function HomeCtaLink({
  locale,
  cta,
  variant = "default",
  className,
}: {
  locale: Locale;
  cta: HomePageLink;
  variant?: "default" | "outline";
  className?: string;
}) {
  return (
    <Link
      href={publicPath(locale, cta.slug)}
      className={cn(
        buttonVariants({ size: "lg", variant }),
        "min-h-11 w-full sm:w-auto",
        className,
      )}
    >
      {cta.label}
    </Link>
  );
}

function FounderMark({ name, src }: { name: string; src: string | null }) {
  return (
    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-14">
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          sizes="56px"
        />
      ) : (
        <span
          aria-hidden
          className="flex size-full items-center justify-center font-heading text-sm font-semibold text-primary/60"
        >
          {startupInitials(name)}
        </span>
      )}
    </div>
  );
}

function SpotlightCard({
  locale,
  startup,
}: {
  locale: Locale;
  startup: StartupPublicListItem;
}) {
  return (
    <Link
      href={founderStartupPath(locale, startup.slug)}
      className="group flex h-full flex-col rounded-xl border bg-card p-5 outline-none transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-6"
    >
      <FounderMark name={startup.name} src={startup.logo_url} />
      <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight text-balance group-hover:underline group-hover:underline-offset-4 sm:text-xl">
        {startup.name}
      </h3>
      <p className="mt-2 line-clamp-4 flex-1 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
        {startup.description}
      </p>
    </Link>
  );
}

function OutcomeCard({
  locale,
  startup,
}: {
  locale: Locale;
  startup: StartupPublicListItem;
}) {
  return (
    <Link
      href={founderStartupPath(locale, startup.slug)}
      className="group flex h-full flex-col rounded-xl border bg-card p-5 outline-none transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-6"
    >
      <p className="line-clamp-5 flex-1 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
        {startup.description}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <FounderMark name={startup.name} src={startup.logo_url} />
        <p className="font-heading text-base font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
          {startup.name}
        </p>
      </div>
    </Link>
  );
}

export function HomePageContent({
  locale,
  copy,
  founders,
  articles,
}: HomePageContentProps) {
  const spotlight = founders.slice(0, SPOTLIGHT_LIMIT);
  const outcomes = founders.slice(0, OUTCOME_LIMIT);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Africa Startup Initiative Program",
          alternateName: "ASIP",
          url: localeUrl(locale),
          description: copy.hero.description,
          parentOrganization: {
            "@type": "Organization",
            name: "Telecel Group",
            url: TELECEL_GROUP_URL,
          },
        }}
      />

      <HomeHero locale={locale} copy={copy.hero} />

      <Section>
        <SectionHeading
          title={copy.impactYears.title}
          description={copy.impactYears.description}
          className="max-w-3xl"
        />
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3 lg:grid-cols-5">
          {copy.impactYears.metrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-card px-4 py-5 text-center sm:px-5 sm:py-6"
            >
              <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {metric.label}
              </dt>
              <dd className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          {copy.impactYears.notice}
        </p>
      </Section>

      <Section className="border-t">
        <SectionHeading
          title={copy.platform.title}
          description={copy.platform.description}
        />
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {copy.platform.steps.map((step, index) => {
            const Icon = STEP_ICONS[step.id];
            return (
              <li
                key={step.id}
                className="flex h-full flex-col rounded-xl border bg-card p-5 sm:p-6"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-heading text-sm font-semibold text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground sm:leading-7">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section className="border-t">
        <SectionHeading
          title={copy.founders.title}
          description={copy.founders.description}
          className="max-w-3xl"
        />
        {spotlight.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {spotlight.map((startup) => (
              <li key={startup.id}>
                <SpotlightCard locale={locale} startup={startup} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border bg-muted/40 px-4 py-5 text-sm text-muted-foreground">
            {copy.founders.empty}
          </p>
        )}
        <div className="mt-8">
          <HomeCtaLink locale={locale} cta={copy.founders.cta} />
        </div>
      </Section>

      <Section className="border-t">
        <SectionHeading
          title={copy.outcomes.title}
          description={copy.outcomes.description}
          className="max-w-3xl"
        />
        {outcomes.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {outcomes.map((startup) => (
              <li key={startup.id}>
                <OutcomeCard locale={locale} startup={startup} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border bg-muted/40 px-4 py-5 text-sm text-muted-foreground">
            {copy.outcomes.empty}
          </p>
        )}
        <div className="mt-8">
          <HomeCtaLink locale={locale} cta={copy.outcomes.cta} />
        </div>
      </Section>

      <Section className="border-t">
        <SectionHeading
          title={copy.ecosystem.title}
          description={copy.ecosystem.description}
          className="max-w-3xl"
        />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {copy.ecosystem.roles.map((role) => {
            const Icon = ROLE_ICONS[role.id];
            return (
              <li
                key={role.id}
                className="rounded-xl border bg-card p-5 sm:p-6"
              >
                <span className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  {role.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground sm:leading-7">
                  {role.description}
                </p>
              </li>
            );
          })}
        </ul>
        <div className="mt-8">
          <HomeCtaLink locale={locale} cta={copy.ecosystem.cta} />
        </div>
      </Section>

      <Section className="border-t">
        <div className="flex max-w-3xl flex-col gap-6">
          <SectionHeading
            title={copy.telecel.title}
            description={copy.telecel.description}
            className="mb-0"
          />
          <a
            href={TELECEL_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "min-h-11 w-full sm:w-auto",
            )}
          >
            {copy.telecel.ctaLabel}
          </a>
        </div>
      </Section>

      <Section className="border-t pb-16 sm:pb-20">
        <div className="rounded-2xl border bg-muted/40 px-6 py-10 sm:px-10 sm:py-12">
          <h2 className="max-w-2xl font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {copy.nextChapter.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {copy.nextChapter.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <HomeCtaLink locale={locale} cta={copy.nextChapter.primaryCta} />
            <HomeCtaLink
              locale={locale}
              cta={copy.nextChapter.secondaryCta}
              variant="outline"
            />
          </div>
        </div>
      </Section>

      <Section className="border-t">
        <div className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={copy.latest.eyebrow}
            title={copy.latest.title}
            description={copy.latest.description}
            className="mb-0 max-w-2xl"
          />
          <HomeCtaLink
            locale={locale}
            cta={copy.latest.cta}
            variant="outline"
            className="shrink-0"
          />
        </div>
        {articles.length > 0 ? (
          <ul className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <li key={article.id}>
                <BlogCard locale={locale} article={article} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border bg-muted/40 px-4 py-5 text-sm text-muted-foreground">
            {copy.latest.empty}
          </p>
        )}
      </Section>
    </main>
  );
}
