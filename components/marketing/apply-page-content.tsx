import { ApplyForm } from "@/components/marketing/apply-form";
import { applyLabelsFor } from "@/components/marketing/apply-labels";
import { InstitutionalHero } from "@/components/marketing/institutional-hero";
import { PageCtaSection } from "@/components/marketing/page-cta-section";
import { Section, SectionHeading } from "@/components/marketing/page-elements";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Locale } from "@/constants/locales";
import type { MarketingPageCopy } from "@/types/marketing-page";

type ApplyPageContentProps = {
  locale: Locale;
  copy: MarketingPageCopy;
  mode: "register" | "apply";
};

export function ApplyPageContent({
  locale,
  copy,
  mode,
}: ApplyPageContentProps) {
  const labels = applyLabelsFor(locale, mode);

  return (
    <main>
      <InstitutionalHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        headingId={
          mode === "register" ? "register-hero-heading" : "apply-hero-heading"
        }
        patternId={mode === "register" ? "register-hero" : "apply-hero"}
        composition={mode === "register" ? "signal" : "gateway"}
        size="compact"
      />

      <Section>
        <Card>
          <CardHeader>
            <CardTitle>{labels.formTitle}</CardTitle>
            <CardDescription>{labels.formDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <ApplyForm locale={locale} labels={labels} mode={mode} />
          </CardContent>
        </Card>

        <div className="mt-10">
          <SectionHeading
            title={copy.sectionTitle}
            description={copy.sectionDescription}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {copy.cards.map((card) => (
              <article
                key={card.title}
                className="rounded-xl border p-5 sm:p-6"
              >
                <h2 className="font-heading text-xl font-semibold tracking-tight">
                  {card.title}
                </h2>
                <p className="mt-3 leading-7 text-muted-foreground">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      {copy.ctaSection ? (
        <PageCtaSection locale={locale} cta={copy.ctaSection} />
      ) : null}
    </main>
  );
}
