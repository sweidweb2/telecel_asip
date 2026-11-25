import { FoundersHeroSection } from "@/components/marketing/founders-hero-section";
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
    showing: "Showing {from} to {to} of {total}",
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
  /** Keeps one random order across pagination for this visit. */
  shuffleSeed?: number;
};

/**
 * Founders directory — hero, filters, StartupCard grid, pagination.
 */
export function PortfolioPageContent({
  locale,
  list,
  options,
  filters = { cohort: null, country: null, sector: null, query: "" },
  shuffleSeed,
}: PortfolioPageContentProps) {
  const copy = marketingCopyFor(locale, "founders");
  const shuffleParam =
    shuffleSeed === undefined ? undefined : String(shuffleSeed);

  return (
    <main>
      <FoundersHeroSection
        locale={locale}
        copy={{
          eyebrow: copy.eyebrow,
          title: copy.title,
          description: copy.description,
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
                s: shuffleParam,
              }}
            />
          </div>
        ) : null}
      </Section>
    </main>
  );
}
