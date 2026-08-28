import {
  PageHero,
  Section,
  SectionHeading,
} from "@/components/marketing/page-elements";
import { PageCtaSection } from "@/components/marketing/page-cta-section";
import type { Locale } from "@/constants/locales";
import type { MarketingPageCopy } from "@/types/marketing-page";

type AlumniPageContentProps = {
  locale: Locale;
  copy: MarketingPageCopy;
};

export function AlumniPageContent({ locale, copy }: AlumniPageContentProps) {
  return (
    <main>
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

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
