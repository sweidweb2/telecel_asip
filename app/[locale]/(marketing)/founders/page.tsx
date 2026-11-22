import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { MarketingPageFallback } from "@/components/marketing/marketing-page-fallback";
import { PortfolioPageContent } from "@/components/marketing/portfolio-page-content";
import { RouteSkeleton } from "@/components/skeleton/route-skeleton";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import {
  getActiveStartupFilterOptions,
  getActiveStartupsPage,
} from "@/data/startups";
import { localeFromParams } from "@/lib/i18n/locale-params";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
import {
  firstSearchParam,
  type RawSearchParams,
} from "@/validations/admin-list-query";
import {
  createShuffleSeed,
  parseActiveStartupFilters,
  parsePortfolioPageParam,
  parseShuffleSeed,
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

function foundersHref(locale: Locale, query: RawSearchParams, seed: number) {
  const params = new URLSearchParams();
  const page = firstSearchParam(query.page);
  const cohort = firstSearchParam(query.cohort);
  const country = firstSearchParam(query.country);
  const sector = firstSearchParam(query.sector);
  const q = firstSearchParam(query.q);
  if (page && page !== "1") params.set("page", page);
  if (cohort) params.set("cohort", cohort);
  if (country) params.set("country", country);
  if (sector) params.set("sector", sector);
  if (q) params.set("q", q);
  params.set("s", String(seed));
  const qs = params.toString();
  const base = publicPath(locale, "founders");
  return qs ? `${base}?${qs}` : base;
}

async function FoundersPage({ params, searchParams }: PageProps) {
  const [locale, query] = await Promise.all([
    localeFromParams(params),
    searchParams,
  ]);
  const shuffleSeed = parseShuffleSeed(query.s);
  if (shuffleSeed === null) {
    redirect(foundersHref(locale, query, createShuffleSeed()));
  }

  const page = parsePortfolioPageParam(query.page);
  const filters = parseActiveStartupFilters(query);
  const [list, options] = await Promise.all([
    getActiveStartupsPage(page, filters, shuffleSeed),
    getActiveStartupFilterOptions(),
  ]);

  return (
    <PortfolioPageContent
      locale={locale}
      list={list}
      options={options}
      filters={filters}
      shuffleSeed={shuffleSeed}
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
