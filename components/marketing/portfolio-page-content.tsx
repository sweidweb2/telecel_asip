import type { ReactNode } from "react";

import { getActiveStartupsPage } from "@/data/startups";
import type { ActiveStartupFilters } from "@/validations/startup";

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

type PortfolioPageContentProps = {
  page?: number;
  filters?: ActiveStartupFilters;
};

/**
 * Founders directory — dynamic (build spec §4).
 * Filters + listing pull Founder; design wiped to skeleton holders.
 */
export async function PortfolioPageContent({
  page = 1,
  filters = { cohort: null, country: null, sector: null, query: "" },
}: PortfolioPageContentProps) {
  const list = await getActiveStartupsPage(page, filters);
  const founders = list.items;

  return (
    <main>
      <section className="border-b border-border px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Founders · Dynamic · Directory / listing
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Founders
          </h1>
          <div className="mt-6 min-h-32 rounded-md border border-dashed border-muted-foreground/35 bg-muted/40 p-4 sm:p-6">
            <EmptySlot label="hero + directory introduction" />
          </div>
        </div>
      </section>

      <PageSection
        title="Filters"
        note="Dynamic — cohort, sector, country, status, outcome, search"
      >
        <EmptySlot label="filter system placeholder (URL search params)" />
      </PageSection>

      <PageSection title="Founder directory" note="pulls Founder">
        {founders.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {founders.map((founder) => (
              <li key={founder.id}>{founder.name}</li>
            ))}
          </ul>
        ) : (
          <EmptySlot label="Founder cards (sector · country · cohort)" />
        )}
        {list.totalPages > 1 ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Page {list.currentPage} of {list.totalPages} · {list.total} total
          </p>
        ) : null}
      </PageSection>

      <PageSection title="Directory CTA" note="Dynamic">
        <EmptySlot label="closing CTA (register interest / contact)" />
      </PageSection>
    </main>
  );
}
