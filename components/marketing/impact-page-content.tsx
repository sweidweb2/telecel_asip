import type { ReactNode } from "react";

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

/**
 * Impact marketing page — static + dynamic (build spec §4).
 * Framing copy + case study template (dynamic per founder).
 */
export function ImpactPageContent() {
  return (
    <main>
      <section className="border-b border-border px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Impact · Static + dynamic
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Impact
          </h1>
          <div className="mt-6 min-h-32 rounded-md border border-dashed border-muted-foreground/35 bg-muted/40 p-4 sm:p-6">
            <EmptySlot label="hero framing copy + CTA" />
          </div>
        </div>
      </section>

      <PageSection title="Seven Years of Impact" note="Static framing">
        <EmptySlot label="narrative progress module (no unverified metrics)" />
      </PageSection>

      <PageSection title="Impact lenses" note="Static framing">
        <EmptySlot label="6 lenses with public framing + evidence-needed fields" />
      </PageSection>

      <PageSection
        title="Case study template"
        note="Dynamic per founder"
      >
        <EmptySlot label="case study slots [Startup]/[barrier]/[support]/[capability]/[outcome]" />
      </PageSection>

      <PageSection title="Evidence rule" note="Static + dynamic">
        <EmptySlot label="publish guard: source, period, owner, last-verified, permission" />
      </PageSection>

      <PageSection title="Impact CTA" note="Static">
        <EmptySlot label="closing CTA to founders / register interest" />
      </PageSection>
    </main>
  );
}
