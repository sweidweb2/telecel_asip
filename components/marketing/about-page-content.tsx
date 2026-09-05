import Link from "next/link";

import { AboutNarrativeSections } from "@/components/marketing/about-narrative-sections";
import { PageHero, Section } from "@/components/marketing/page-elements";
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
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        action={
          copy.cta && ctaHref ? (
            <Link
              href={ctaHref}
              className={cn(
                buttonVariants(),
                "min-h-11 w-full sm:w-auto",
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
    </main>
  );
}
