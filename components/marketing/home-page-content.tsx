import type { ReactNode } from "react";

import { TELECEL_GROUP_URL } from "@/components/layout/site-footer-labels";
import { HomeLatestInsightsSection } from "@/components/marketing/home-latest-insights-section";
import { HomeNextChapterSection } from "@/components/marketing/home-next-chapter-section";
import { JsonLd } from "@/components/seo/json-ld";
import { homeCopyFor } from "@/constants/home-copy";
import type { Locale } from "@/constants/locales";
import { localeUrl } from "@/lib/seo/alternates";
import type { ArticleListItem } from "@/types/article";
import type { StartupPublicListItem } from "@/types/startup";

type HomeImpactMetric = {
  id: string;
  claim_label: string;
  value: string;
  unit: string | null;
};

type HomePageContentProps = {
  locale: Locale;
  metrics: HomeImpactMetric[];
  founders: StartupPublicListItem[];
  articles: ArticleListItem[];
};

function HomeSection({
  title,
  source,
  children,
}: {
  title: string;
  source?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {source ? `${title} · pulls ${source}` : title}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>
        <div className="mt-4 min-h-24 rounded-md border border-dashed border-muted-foreground/35 bg-muted/40 p-4 sm:p-6">
          {children}
        </div>
      </div>
    </section>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      Skeleton holder — {label}
    </p>
  );
}

export function HomePageContent({
  locale,
  metrics,
  founders,
  articles,
}: HomePageContentProps) {
  const copy = homeCopyFor(locale);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Africa Startup Initiative Program",
          alternateName: "ASIP",
          url: localeUrl(locale),
          description:
            "ASIP by Telecel Group connects African technology founders to expertise, capital pathways, markets and partners.",
          parentOrganization: {
            "@type": "Organization",
            name: "Telecel Group",
            url: TELECEL_GROUP_URL,
          },
        }}
      />

      <section className="border-b border-border px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Hero
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Africa Startup Initiative Program
          </h1>
          <div className="mt-6 min-h-32 rounded-md border border-dashed border-muted-foreground/35 bg-muted/40 p-4 sm:p-6">
            <EmptySlot label="hero media, headline, and CTAs" />
          </div>
        </div>
      </section>

      <HomeSection title="Impact strip" source="Impact Metric">
        {metrics.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {metrics.map((metric) => (
              <li key={metric.id}>
                <span className="font-medium">{metric.value}</span>
                {metric.unit ? ` ${metric.unit}` : null}
                {" — "}
                {metric.claim_label}
              </li>
            ))}
          </ul>
        ) : (
          <EmptySlot label="Impact Metric rows for homepage display" />
        )}
      </HomeSection>

      <HomeSection title="Platform model">
        <EmptySlot label="Discover → Build → Connect → Commercialise → Scale" />
      </HomeSection>

      <HomeSection title="Founder spotlight" source="Founder">
        {founders.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {founders.map((founder) => (
              <li key={founder.id}>{founder.name}</li>
            ))}
          </ul>
        ) : (
          <EmptySlot label="Founder / startup spotlight items" />
        )}
      </HomeSection>

      <HomeSection title="Impact module">
        <EmptySlot label="founder outcome stories and impact CTA" />
      </HomeSection>

      <HomeSection title="Ecosystem">
        <EmptySlot label="partner roles and ecosystem CTA" />
      </HomeSection>

      <HomeSection title="Telecel module">
        <EmptySlot label="Telecel connection copy and CTA" />
      </HomeSection>

      <HomeNextChapterSection locale={locale} copy={copy.nextChapter} />

      <HomeLatestInsightsSection
        locale={locale}
        copy={copy.latest}
        articles={articles}
      />
    </main>
  );
}
