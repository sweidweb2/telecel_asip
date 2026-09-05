import type { ReactNode } from "react";

import { PageCtaSection } from "@/components/marketing/page-cta-section";
import type { Locale } from "@/constants/locales";
import { programmeCopyFor } from "@/constants/programme-copy";

function PageSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {note ? `${title} · ${note}` : title}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>
        <div className="mt-4 min-h-24 rounded-md border border-dashed border-muted-foreground/35 bg-muted/40 p-4 sm:p-6">
          {children}
        </div>
      </div>
    </section>
  );
}

function EmptySlot({ label }: { label: string }) {
  return (
    <p className="text-sm text-muted-foreground">Skeleton holder — {label}</p>
  );
}

type ProgrammePageContentProps = {
  locale: Locale;
};

/**
 * Programme marketing page — mostly static (build spec §4).
 * Cohort-conditional CTA noted; design wiped for the next pass.
 */
export function ProgrammePageContent({ locale }: ProgrammePageContentProps) {
  const copy = programmeCopyFor(locale);

  return (
    <main>
      <section className="border-b border-border px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Programme · Mostly static · Cohort-conditional CTA
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Programme
          </h1>
          <div className="mt-6 min-h-32 rounded-md border border-dashed border-muted-foreground/35 bg-muted/40 p-4 sm:p-6">
            <EmptySlot label="hero + Register interest / Explore past cohorts CTAs" />
          </div>
        </div>
      </section>

      <PageSection title="Who it is for" note="Mostly static">
        <EmptySlot label="audience module" />
      </PageSection>

      <PageSection title="Founder journey" note="Mostly static">
        <EmptySlot label="6 stages (Discover → Select → Build → Connect → Commercialise → Grow)" />
      </PageSection>

      <PageSection title="What founders gain" note="Mostly static">
        <EmptySlot label="7 value cards" />
      </PageSection>

      <PageSection title="Eligibility" note="Cohort-conditional">
        <EmptySlot label="general eligibility list; swap for cohort-specific criteria when Apply opens" />
      </PageSection>

      <PageCtaSection locale={locale} cta={copy.ctaSection} />
    </main>
  );
}
