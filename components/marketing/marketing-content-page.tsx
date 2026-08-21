import Link from "next/link";

import { PageHero, Section, SectionHeading } from "@/components/marketing/page-elements";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { marketingCopyFor } from "@/constants/marketing-copy";
import { publicPath } from "@/constants/routes";
import type { MarketingContentSlug } from "@/types/marketing-page";

export function MarketingContentPage({ locale, slug }: { locale: Locale; slug: MarketingContentSlug }) {
  const copy = marketingCopyFor(locale, slug);
  return (
    <main>
      <PageHero eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <Section>
        <p className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">{copy.notice}</p>
        <div className="mt-10">
          <SectionHeading title={copy.sectionTitle} description={copy.sectionDescription} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {copy.cards.map((card) => (
              <article key={card.title} className="rounded-xl border p-5 sm:p-6">
                <h2 className="font-heading text-xl font-semibold tracking-tight">{card.title}</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{card.description}</p>
              </article>
            ))}
          </div>
          {copy.cta ? (
            <Button asChild className="mt-8 min-h-11 w-full sm:w-auto">
              <Link href={publicPath(locale, copy.cta.slug)}>{copy.cta.label}</Link>
            </Button>
          ) : null}
        </div>
      </Section>
    </main>
  );
}
