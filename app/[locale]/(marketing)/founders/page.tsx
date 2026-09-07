import type { Metadata } from "next";
import { Suspense } from "react";

import { MarketingPageFallback } from "@/components/marketing/marketing-page-fallback";
import { PortfolioPageContent } from "@/components/marketing/portfolio-page-content";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
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
          title: "Fondateurs ASIP | Cohortes, secteurs et marchés",
          description:
            "Explorez les fondateurs technologiques africains accompagnés par ASIP par cohorte, pays, secteur et résultats.",
        }
      : {
          locale,
          path: "/founders",
          title: "ASIP Founders | Cohorts, Sectors and Markets",
          description:
            "Explore African technology founders supported by ASIP across cohorts, countries, sectors and outcomes.",
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

  return (
    <PortfolioPageContent
      locale={locale}
      page={parsePortfolioPageParam(query.page)}
      filters={parseActiveStartupFilters(query)}
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
