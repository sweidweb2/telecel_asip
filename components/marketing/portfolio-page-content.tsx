import Link from "next/link";

import { PageHero, Section } from "@/components/marketing/page-elements";
import { PortfolioPagination } from "@/components/marketing/portfolio-pagination";
import { PortfolioStartupsGrid } from "@/components/marketing/portfolio-startups-grid";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { MARKETING_MEDIA } from "@/constants/marketing-media";
import { publicPath } from "@/constants/routes";
import {
  getActiveStartupFilterOptions,
  getActiveStartupsPage,
} from "@/data/startups";
import type { MarketingPageCopy } from "@/types/marketing-page";
import type { ActiveStartupFilters } from "@/validations/startup";
import { cn } from "@/lib/utils";

const PAGINATION_LABELS = {
  en: {
    showing: "Showing {from}–{to} of {total}",
    previous: "Previous",
    next: "Next",
  },
  fr: {
    showing: "Affichage de {from} à {to} sur {total}",
    previous: "Précédent",
    next: "Suivant",
  },
} as const;

type PortfolioPageContentProps = {
  locale: Locale;
  copy: MarketingPageCopy;
  page?: number;
  filters?: ActiveStartupFilters;
};

export async function PortfolioPageContent({
  locale,
  copy,
  page = 1,
  filters = { cohort: null, country: null, sector: null, query: "" },
}: PortfolioPageContentProps) {
  const [list, options] = await Promise.all([
    getActiveStartupsPage(page, filters),
    getActiveStartupFilterOptions(),
  ]);
  const cta = copy.ctaSection;

  return (
    <main>
      <PageHero
        variant="index"
        media={MARKETING_MEDIA.founders}
        locale={locale}
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <Section className="border-t pt-8 sm:pt-10">
        <PortfolioStartupsGrid
          locale={locale}
          startups={list.items}
          total={list.total}
          options={options}
          filters={filters}
        />

        {list.total > 0 ? (
          <div className="mt-10">
            <PortfolioPagination
              locale={locale}
              currentPage={list.currentPage}
              totalPages={list.totalPages}
              total={list.total}
              pageSize={list.pageSize}
              labels={PAGINATION_LABELS[locale]}
              filters={{
                cohort: filters.cohort ?? undefined,
                country: filters.country ?? undefined,
                sector: filters.sector ?? undefined,
                q: filters.query || undefined,
              }}
            />
          </div>
        ) : null}
      </Section>

      {cta ? (
        <Section className="border-t pb-16 sm:pb-20 lg:pb-24">
          <section className="rounded-2xl border bg-muted/40 px-6 py-10 text-center sm:px-10 sm:py-12">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {cta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              {cta.description}
            </p>
            <Link
              href={`${publicPath(locale, cta.slug)}${cta.hash ? `#${cta.hash}` : ""}`}
              className={cn(
                buttonVariants(),
                "mt-8 inline-flex min-h-11 w-full sm:w-auto",
              )}
            >
              {cta.label}
            </Link>
          </section>
        </Section>
      ) : null}
    </main>
  );
}
