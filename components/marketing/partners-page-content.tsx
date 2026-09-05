import type { ReactNode } from "react";

import { PageCtaSection } from "@/components/marketing/page-cta-section";
import { partnerLabelsFor } from "@/components/marketing/partner-labels";
import { PartnersNetwork } from "@/components/marketing/partners-network";
import type { Locale } from "@/constants/locales";
import { partnersCopyFor } from "@/constants/partners-copy";
import type { PartnerPublicItem } from "@/types/partner";

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
  active: PartnerPublicItem[];
  historical: PartnerPublicItem[];
};

/**
 * Partners marketing page — mostly static template (build spec §4).
 * Network logos pull from `getPublicPartners`.
 */
export function PartnersPageContent({
  locale,
  active,
  historical,
}: PartnersPageContentProps) {
  const copy = partnersCopyFor(locale);
  const labels = partnerLabelsFor(locale);

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

      <PageSection title={copy.logos.title} note="Live partners">
        <PartnersNetwork
          locale={locale}
          partners={active}
          typeRows={copy.types.rows}
        />
      </PageSection>

      {historical.length > 0 ? (
        <PageSection title={labels.historicalTitle} note="Live partners">
          <p className="mb-8 text-sm text-muted-foreground sm:text-base">
            {labels.historicalDescription}
          </p>
          <PartnersNetwork
            locale={locale}
            partners={historical}
            typeRows={copy.types.rows}
          />
        </PageSection>
      ) : null}

      <PageCtaSection locale={locale} cta={copy.ctaSection} />
    </main>
  );
}
