import {
  PageHero,
  Section,
  SectionHeading,
} from "@/components/marketing/page-elements";
import { PageCtaSection } from "@/components/marketing/page-cta-section";
import { LogoCloudGrid } from "@/components/ui/logo-cloud";
import { PARTNER_LOGOS } from "@/constants/partner-logos";
import type { Locale } from "@/constants/locales";
import type { MarketingPageCopy } from "@/types/marketing-page";

type PartnersPageContentProps = {
  locale: Locale;
  copy: MarketingPageCopy;
};

export function PartnersPageContent({
  locale,
  copy,
}: PartnersPageContentProps) {
  const logos = copy.partnersSection;

  return (
    <main>
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      {logos ? (
        <Section id="partners" className="scroll-mt-20 border-t">
          <SectionHeading
            eyebrow={logos.eyebrow}
            title={logos.title}
            description={logos.description}
            className="mx-auto mb-10 max-w-2xl text-center sm:mb-12"
          />
          <LogoCloudGrid logos={PARTNER_LOGOS} />
        </Section>
      ) : null}

      <Section className="border-t">
        <SectionHeading
          title={copy.sectionTitle}
          description={copy.sectionDescription}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {copy.cards.map((card) => (
            <article key={card.title} className="rounded-xl border p-5 sm:p-6">
              <h3 className="font-heading text-lg font-semibold tracking-tight sm:text-xl">
                {card.title}
              </h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                {card.description}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-8 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {copy.notice}
        </p>
      </Section>

      {copy.ctaSection ? (
        <PageCtaSection locale={locale} cta={copy.ctaSection} />
      ) : null}
    </main>
  );
}
