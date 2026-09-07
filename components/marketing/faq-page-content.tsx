import { FaqTabsSection } from "@/components/marketing/faq-tabs-section";
import FaqSection from "@/components/ui/habit-faq-scroller";
import { InstitutionalHero } from "@/components/marketing/institutional-hero";
import { PageCtaSection } from "@/components/marketing/page-cta-section";
import { Section } from "@/components/marketing/page-elements";
import type { Locale } from "@/constants/locales";
import { buildFaqScrollerData } from "@/lib/marketing/build-faq-scroller-data";
import type { MarketingPageCopy } from "@/types/marketing-page";

type FaqPageContentProps = {
  locale: Locale;
  copy: MarketingPageCopy;
};

export function FaqPageContent({ locale, copy }: FaqPageContentProps) {
  return (
    <>
      <InstitutionalHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        headingId="faq-hero-heading"
        patternId="faq-hero"
        composition="constellation"
      />

      <Section className="pt-10 pb-10 sm:pt-14 sm:pb-14 lg:pt-16">
        <FaqSection data={buildFaqScrollerData(copy)} />
      </Section>

      <Section className="border-t py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] md:items-start md:gap-8 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0 md:sticky md:top-20">
            <h2 className="font-heading text-base font-semibold tracking-tight sm:text-lg">
              {copy.tabsSectionTitle ?? "Browse by topic"}
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              {copy.tabsSectionDescription}
            </p>
          </div>
          <div className="min-w-0">
            <FaqTabsSection copy={copy} />
          </div>
        </div>
      </Section>

      {copy.ctaSection ? (
        <PageCtaSection locale={locale} cta={copy.ctaSection} />
      ) : null}
    </>
  );
}
