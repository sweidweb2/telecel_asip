import type { ReactNode } from "react";

import { TELECEL_GROUP_URL } from "@/components/layout/site-footer-labels";
import { HomeEcosystemSection } from "@/components/marketing/home-ecosystem-section";
import { HomeFounderSpotlightSection } from "@/components/marketing/home-founder-spotlight-section";
import { HomeHero } from "@/components/marketing/home-hero";
import { HomeImpactYearsSection } from "@/components/marketing/home-impact-years-section";
import { HomeLatestInsightsSection } from "@/components/marketing/home-latest-insights-section";
import { HomeNextChapterSection } from "@/components/marketing/home-next-chapter-section";
import { HomePlatformModelSection } from "@/components/marketing/home-platform-model-section";
import { HomeTelecelConnectionSection } from "@/components/marketing/home-telecel-connection-section";
import { JsonLd } from "@/components/seo/json-ld";
import { homeCopyFor } from "@/constants/home-copy";
import type { Locale } from "@/constants/locales";
import { localeUrl } from "@/lib/seo/alternates";
import type { ArticleListItem } from "@/types/article";

type HomeImpactMetric = {
  id: string;
  claim_label: string;
  value: string;
  unit: string | null;
};

type HomePageContentProps = {
  locale: Locale;
  metrics: HomeImpactMetric[];
  articles: ArticleListItem[];
  openApplications: boolean;
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
  articles,
  openApplications,
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

      <HomeHero
        locale={locale}
        copy={copy.hero}
        openApplications={openApplications}
      />

      <HomeImpactYearsSection copy={copy.impactYears} metrics={metrics} />

      <HomePlatformModelSection copy={copy.platform} />

      <HomeFounderSpotlightSection
        locale={locale}
        copy={copy.founders}
      />

      <HomeSection title="Impact module">
        <EmptySlot label="founder outcome stories and impact CTA" />
      </HomeSection>

      <HomeEcosystemSection locale={locale} copy={copy.ecosystem} />

      <HomeTelecelConnectionSection copy={copy.telecel} />

      <HomeNextChapterSection
        locale={locale}
        copy={copy.nextChapter}
        openApplications={openApplications}
      />

      <HomeLatestInsightsSection
        locale={locale}
        copy={copy.latest}
        articles={articles}
      />
    </main>
  );
}
