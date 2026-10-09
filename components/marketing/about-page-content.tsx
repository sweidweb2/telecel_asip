import Link from "next/link";

import { AboutHero } from "@/components/marketing/about-hero";
import { AboutNarrativeSections } from "@/components/marketing/about-narrative-sections";
import { IllustratedWordmarkCta } from "@/components/marketing/illustrated-wordmark-cta";
import { Section } from "@/components/marketing/page-elements";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { MarketingPageCopy } from "@/types/marketing-page";
import { cn } from "@/lib/utils";

type AboutPageContentProps = {
  locale: Locale;
  copy: MarketingPageCopy;
};

export function AboutPageContent({ locale, copy }: AboutPageContentProps) {
  const ctaHref = copy.cta
    ? `${publicPath(locale, copy.cta.slug)}${copy.cta.hash ? `#${copy.cta.hash}` : ""}`
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
            <Link
              href={ctaHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-h-11 w-full rounded-full bg-asip-coral px-8 text-white hover:bg-asip-coral-hover sm:w-auto",
              )}
            >
              {copy.cta.label}
            </Link>
          ) : null
        }
      />

      {copy.aboutNarrative ? (
        <Section className="border-t py-14 sm:py-16 lg:py-20">
          <AboutNarrativeSections locale={locale} narrative={copy.aboutNarrative} />
        </Section>
      ) : null}

      {copy.ctaSection ? (
        <IllustratedWordmarkCta
          className="border-t border-border"
          title={copy.ctaSection.title}
          description={copy.ctaSection.description}
          primary={{
            href: `${publicPath(locale, copy.ctaSection.slug)}${copy.ctaSection.hash ? `#${copy.ctaSection.hash}` : ""}`,
            label: copy.ctaSection.label,
          }}
        />
      ) : null}
    </main>
  );
}
