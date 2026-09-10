import { FoundersHeroSection } from "@/components/marketing/founders-hero-section";
import { PageCtaSection } from "@/components/marketing/page-cta-section";
import { Section } from "@/components/marketing/page-elements";
import {
  FOUNDERS_RESULTS_ID,
  PortfolioPagination,
} from "@/components/marketing/portfolio-pagination";
import { PortfolioStartupsGrid } from "@/components/marketing/portfolio-startups-grid";
import type { Locale } from "@/constants/locales";
import { marketingCopyFor } from "@/constants/marketing-copy";
import type {
  StartupFilterOptions,
  StartupPublicPageResult,
} from "@/types/startup";
import type { ActiveStartupFilters } from "@/validations/startup";

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
  list: StartupPublicPageResult;
  options: StartupFilterOptions;
  filters?: ActiveStartupFilters;
};

/**
 * Founders directory — hero, filters, StartupCard grid, pagination, CTA.
 */
export function PortfolioPageContent({
  locale,
  list,
  options,
  filters = { cohort: null, country: null, sector: null, query: "" },
}: PortfolioPageContentProps) {
  const copy = marketingCopyFor(locale, "founders");

  return (
    <main>
      <FoundersHeroSection
        locale={locale}
        copy={{
          eyebrow: copy.eyebrow,
          title: copy.title,
          description: copy.description,
          cta: copy.cta,
        }}
      />

      <Section
        id={FOUNDERS_RESULTS_ID}
        className="scroll-mt-24 pt-8 sm:pt-10"
      >
        <PortfolioStartupsGrid
          locale={locale}
          startups={list.items}
          total={list.total}
          options={options}
          filters={filters}
          fromPage={list.currentPage}
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

      {copy.ctaSection ? (
        <PageCtaSection locale={locale} cta={copy.ctaSection} />
      ) : null}
    </main>
  );
}
