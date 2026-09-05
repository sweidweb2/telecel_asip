import { ApplyForm } from "@/components/marketing/apply-form";
import { applyLabelsFor } from "@/components/marketing/apply-labels";
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
  const pageLabel = mode === "apply" ? "Apply" : "Register interest";

  return (
    <main>
      <section className="border-b border-border px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {pageLabel} · Shared template · Cohort-gated
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {copy.title}
          </h1>
          <div className="mt-6 min-h-32 rounded-md border border-dashed border-muted-foreground/35 bg-muted/40 p-4 sm:p-6">
            <p className="text-sm text-muted-foreground">
              Skeleton holder — hero ({copy.eyebrow})
            </p>
          </div>
        </div>
      </section>

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
