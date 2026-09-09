import { cn } from "@/lib/utils";
import type { ImpactPageCopy } from "@/types/marketing-page";

const LENS_PILL_STYLES = [
  "bg-brand/12 text-brand ring-brand/25",
  "bg-brand-mid/15 text-[#3d6b2f] ring-brand-mid/35",
  "bg-asip-magenta/12 text-[#9a2f78] ring-asip-magenta/25",
  "bg-asip-coral/12 text-[#b02a48] ring-asip-coral/25",
  "bg-asip-ink/10 text-asip-ink ring-asip-ink/20",
  "bg-brand/12 text-brand ring-brand/25",
] as const;

type ImpactLensesSectionProps = {
  lenses: ImpactPageCopy["lenses"];
};

/**
 * Public Impact lenses — framing only.
 * Evidence-needed notes stay in copy for CMS; they are not published here.
 */
export function ImpactLensesSection({ lenses }: ImpactLensesSectionProps) {
  return (
    <section className="border-b border-border bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {lenses.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {lenses.description}
          </p>
        </header>

        <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card sm:mt-12">
          <div className="hidden grid-cols-[minmax(10rem,14rem)_1fr] gap-6 border-b border-border bg-muted/40 px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:grid sm:px-6">
            <span>{lenses.columns.lens}</span>
            <span>{lenses.columns.framing}</span>
          </div>

          <ul className="divide-y divide-border">
            {lenses.rows.map((row, index) => {
              const pill = LENS_PILL_STYLES[index % LENS_PILL_STYLES.length];

              return (
                <li
                  key={row.id}
                  className="group grid gap-3 px-5 py-5 transition-colors hover:bg-muted/35 sm:grid-cols-[minmax(10rem,14rem)_1fr] sm:items-center sm:gap-6 sm:px-6 sm:py-6"
                >
                  <div className="min-w-0">
                    <span
                      className={cn(
                        "inline-flex min-h-8 items-center rounded-md px-2.5 py-1 font-heading text-sm font-semibold tracking-tight ring-1 ring-inset",
                        pill,
                      )}
                    >
                      {row.lens}
                    </span>
                  </div>

                  <p className="text-base leading-7 text-foreground/80 sm:text-[1.05rem] sm:leading-8">
                    {row.framing}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
