import Link from "next/link";
import { redirect } from "next/navigation";

import { PageHero, Section, SectionHeading } from "@/components/marketing/page-elements";
import { PortfolioPagination } from "@/components/marketing/portfolio-pagination";
import { StartupCard } from "@/components/marketing/startup-card";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { getActiveStartupsPage } from "@/data/startups";
import type { MarketingPageCopy } from "@/types/marketing-page";
import { cn } from "@/lib/utils";

const PAGINATION_LABELS = {
  en: {
    showing: "Showing {from}–{to} of {total} startups",
    previous: "Previous",
    next: "Next",
    empty: "No active startups to show yet.",
  },
  fr: {
    showing: "Affichage de {from} à {to} sur {total} startups",
    previous: "Précédent",
    next: "Suivant",
    empty: "Aucune startup active à afficher pour le moment.",
  },
} as const;

type PortfolioPageContentProps = {
  locale: Locale;
  copy: MarketingPageCopy;
  page: number;
};

export async function PortfolioPageContent({
  locale,
  copy,
  page,
}: PortfolioPageContentProps) {
  const { items, total, totalPages, pageSize } =
    await getActiveStartupsPage(page);
  const cta = copy.ctaSection;
  const labels = PAGINATION_LABELS[locale];

  if (page > totalPages && total > 0) {
    redirect(`${publicPath(locale, "portfolio")}?page=${totalPages}`);
  }
  if (page > 1 && total === 0) {
    redirect(publicPath(locale, "portfolio"));
  }

  const currentPage = page;

  return (
    <main>
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <Section className="border-t">
        <p className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {copy.notice}
        </p>

        <div className="mt-10 sm:mt-12">
          <SectionHeading
            title={copy.sectionTitle}
            description={copy.sectionDescription}
          />

          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed px-6 py-12 text-center text-muted-foreground">
              {labels.empty}
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-8">
              {items.map((startup) => (
                <li key={startup.id} className="min-w-0">
                  <StartupCard
                    startup={startup}
                    locale={locale}
                    fromPage={currentPage}
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 sm:mt-12">
            <PortfolioPagination
              locale={locale}
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              labels={labels}
            />
          </div>
        </div>
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
