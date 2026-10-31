import { AboutHero } from "@/components/marketing/about-hero";
import { AboutNarrativeSections } from "@/components/marketing/about-narrative-sections";
import {
  CoralCtaLink,
  Section,
} from "@/components/marketing/page-elements";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { MarketingPageCopy } from "@/types/marketing-page";

type AboutPageContentProps = {
  locale: Locale;
  copy: MarketingPageCopy;
};

export function AboutPageContent({ locale, copy }: AboutPageContentProps) {
  const ctaHref = copy.cta
    ? publicPath(locale, copy.cta.slug, copy.cta.hash)
    : null;

  return (
    <main>
      <AboutHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        heroChips={copy.heroChips}
        action={
          copy.cta && ctaHref ? (
            <CoralCtaLink href={ctaHref}>{copy.cta.label}</CoralCtaLink>
          ) : null
        }
      />

      {copy.aboutNarrative ? (
        <Section className="border-t py-14 sm:py-16 lg:py-20">
          <AboutNarrativeSections locale={locale} narrative={copy.aboutNarrative} />
        </Section>
      ) : null}
    </main>
  );
}
