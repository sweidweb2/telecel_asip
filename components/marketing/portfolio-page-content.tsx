import Link from "next/link";

import { PageHero, Section } from "@/components/marketing/page-elements";
import { PortfolioStartupsGrid } from "@/components/marketing/portfolio-startups-grid";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { getAllActiveStartups } from "@/data/startups";
import type { MarketingPageCopy } from "@/types/marketing-page";
import { cn } from "@/lib/utils";

type PortfolioPageContentProps = {
  locale: Locale;
  copy: MarketingPageCopy;
  /** From `?year=YYYY`, or `"all"`. */
  initialYear?: string;
};

export async function PortfolioPageContent({
  locale,
  copy,
  initialYear = "all",
}: PortfolioPageContentProps) {
  const startups = await getAllActiveStartups();
  const cta = copy.ctaSection;

  return (
    <main>
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <Section className="border-t pt-8 sm:pt-10">
        <PortfolioStartupsGrid
          locale={locale}
          startups={startups}
          initialYear={initialYear}
        />
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
