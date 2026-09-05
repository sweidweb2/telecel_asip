import type { ReactNode } from "react";

import { PageCtaSection } from "@/components/marketing/page-cta-section";
import type { Locale } from "@/constants/locales";
import { alumniCopyFor } from "@/constants/alumni-copy";

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

type AlumniPageContentProps = {
  locale: Locale;
};

/**
 * Alumni marketing page — built but hidden (build spec §4).
 * Draft in CMS; publish only on formal approval. Keep noindex / sitemap-excluded.
 */
export function AlumniPageContent({ locale }: AlumniPageContentProps) {
  const copy = alumniCopyFor(locale);

  return (
    <main>
      <section className="border-b border-border px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Alumni · Built, hidden · Draft in CMS — publish only on formal
            approval
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Alumni
          </h1>
          <div className="mt-6 min-h-32 rounded-md border border-dashed border-muted-foreground/35 bg-muted/40 p-4 sm:p-6">
            <EmptySlot label="HOLD hero copy + community CTA" />
          </div>
        </div>
      </section>

      <PageSection
        title="Purpose"
        note="Draft in CMS — publish only on formal approval"
      >
        <EmptySlot label="alumni purpose / after-the-cohort module" />
      </PageSection>

      <PageSection
        title="Proposed benefits"
        note="Draft in CMS — publish only on formal approval"
      >
        <EmptySlot label="5 proposed benefit items (HOLD)" />
      </PageSection>

      <PageSection
        title="Activation notice"
        note="Built, hidden until formal approval"
      >
        <EmptySlot label="hold notice + activation runbook gate" />
      </PageSection>

      <PageCtaSection locale={locale} cta={copy.ctaSection} />
    </main>
  );
}
