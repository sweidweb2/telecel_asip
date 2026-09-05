import type { ReactNode } from "react";

import { PageCtaSection } from "@/components/marketing/page-cta-section";
import type { Locale } from "@/constants/locales";
import { partnersCopyFor } from "@/constants/partners-copy";

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

type PartnersPageContentProps = {
  locale: Locale;
};

/**
 * Partners marketing page — mostly static template (build spec §4).
 * Design wiped; section shells only until the next design pass.
 */
export function PartnersPageContent({ locale }: PartnersPageContentProps) {
  const copy = partnersCopyFor(locale);

  return (
    <main>
      <section className="border-b border-border px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Partners · Mostly static
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Partners
          </h1>
          <div className="mt-6 min-h-32 rounded-md border border-dashed border-muted-foreground/35 bg-muted/40 p-4 sm:p-6">
            <EmptySlot label="hero + Discuss a partnership CTA" />
          </div>
        </div>
      </section>

      <PageSection title="Partner proposition" note="Mostly static">
        <EmptySlot label="partner proposition module" />
      </PageSection>

      <PageSection title="Partner types" note="Mostly static">
        <EmptySlot label="6 partner type rows (value + engagement examples)" />
      </PageSection>

      <PageSection title="Partners network" note="Mostly static">
        <EmptySlot label="active / historical partner logos" />
      </PageSection>

      <PageCtaSection locale={locale} cta={copy.ctaSection} />
    </main>
  );
}
