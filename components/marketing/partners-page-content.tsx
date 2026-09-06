import { PageCtaSection } from "@/components/marketing/page-cta-section";
import { partnerLabelsFor } from "@/components/marketing/partner-labels";
import { PartnersHeroSection } from "@/components/marketing/partners-hero-section";
import { PartnersNetwork } from "@/components/marketing/partners-network";
import { PartnersPropositionSection } from "@/components/marketing/partners-proposition-section";
import { PartnersTypesSection } from "@/components/marketing/partners-types-section";
import type { Locale } from "@/constants/locales";
import { partnersCopyFor } from "@/constants/partners-copy";
import type { PartnerPublicItem } from "@/types/partner";
import { cn } from "@/lib/utils";

type PartnersPageContentProps = {
  locale: Locale;
  active: PartnerPublicItem[];
  historical: PartnerPublicItem[];
};

/**
 * Partners marketing page — hero, proposition, type routes, live network logos, CTA.
 */
export function PartnersPageContent({
  locale,
  active,
  historical,
}: PartnersPageContentProps) {
  const copy = partnersCopyFor(locale);
  const labels = partnerLabelsFor(locale);

  return (
    <main>
      <PartnersHeroSection locale={locale} copy={copy.hero} />
      <PartnersPropositionSection locale={locale} copy={copy.proposition} />
      <PartnersTypesSection copy={copy.types} />

      <section
        id="network"
        aria-labelledby="partners-network-heading"
        className={cn(
          "border-b border-border bg-background",
          "px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
        )}
      >
        <div className="mx-auto w-full max-w-7xl">
          <h2
            id="partners-network-heading"
            className="mx-auto max-w-2xl text-center font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl"
          >
            {copy.logos.title}
          </h2>
          <div className="mt-10 sm:mt-12">
            <PartnersNetwork
              locale={locale}
              partners={active}
              typeRows={copy.types.rows}
            />
          </div>
        </div>
      </section>

      {historical.length > 0 ? (
        <section
          id="previous-chapters"
          aria-labelledby="partners-historical-heading"
          className={cn(
            "border-b border-border bg-[color-mix(in_oklab,var(--brand-subtle)_40%,var(--background))]",
            "px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
          )}
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                id="partners-historical-heading"
                className="font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl"
              >
                {labels.historicalTitle}
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {labels.historicalDescription}
              </p>
            </div>
            <div className="mt-10 sm:mt-12">
              <PartnersNetwork
                locale={locale}
                partners={historical}
                typeRows={copy.types.rows}
              />
            </div>
          </div>
        </section>
      ) : null}

      <PageCtaSection locale={locale} cta={copy.ctaSection} />
    </main>
  );
}
