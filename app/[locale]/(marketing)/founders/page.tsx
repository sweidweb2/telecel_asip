import type { Metadata } from "next";
import { Suspense } from "react";

import { MarketingPageFallback } from "@/components/marketing/marketing-page-fallback";
import { PortfolioPageContent } from "@/components/marketing/portfolio-page-content";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import {
  getActiveStartupFilterOptions,
  getActiveStartupsPage,
} from "@/data/startups";
import { localeFromParams } from "@/lib/i18n/locale-params";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
import type { RawSearchParams } from "@/validations/admin-list-query";
import {
  parseActiveStartupFilters,
  parsePortfolioPageParam,
} from "@/validations/startup";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await localeFromParams(params);
  return buildMarketingMetadata(
    locale === "fr"
      ? {
          locale,
          path: "/founders",
          title: "Fondateurs ASIP | Portefeuille par secteur et marché",
          description:
            "Explorez les fondateurs et startups ASIP par pays, secteur et cohorte, avec des histoires et résultats vérifiés.",
        }
      : {
          locale,
          path: "/founders",
          title: "ASIP Founders | Portfolio by Sector & Market",
          description:
            "Explore ASIP founders and startups by country, sector and cohort, with verified company stories and outcomes.",
        },
  );
}

function FoundersFallback() {
  return (
    <RouteSkeleton
      name="marketing-founders"
      fallback={<MarketingPageFallback />}
    />
  );
}

async function FoundersPage({ params, searchParams }: PageProps) {
  const [locale, query] = await Promise.all([
    localeFromParams(params),
    searchParams,
  ]);
  const page = parsePortfolioPageParam(query.page);
  const filters = parseActiveStartupFilters(query);
  const [list, options] = await Promise.all([
    getActiveStartupsPage(page, filters),
    getActiveStartupFilterOptions(),
  ]);

  return (
    <PortfolioPageContent
      locale={locale}
      list={list}
      options={options}
      filters={filters}
    />
  );
}

export default function Page(props: PageProps) {
  return (
    <Suspense fallback={<FoundersFallback />}>
      <FoundersPage {...props} />
    </Suspense>
  );
}
