import { cn } from "@/lib/utils";
import type { PartnersPageCopy } from "@/types/marketing-page";

type PartnersTypesSectionProps = {
  copy: PartnersPageCopy["types"];
  className?: string;
};

/**
 * Six partner routes — value and engagement examples in an open list,
 * not a logo wall or icon-card grid.
 */
export function PartnersTypesSection({
  copy,
  className,
}: PartnersTypesSectionProps) {
  return (
    <section
      id="partner-types"
      aria-labelledby="partners-types-heading"
      className={cn(
        "border-b border-border bg-[color-mix(in_oklab,var(--brand-subtle)_55%,var(--background))]",
        "px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-2xl">
          <h2
            id="partners-types-heading"
            className="font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl"
          >
            {copy.title}
          </h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {copy.description}
          </p>
        </div>

        <div className="mt-10 border-t border-border sm:mt-12">
          <div
            className="hidden border-b border-border py-4 lg:grid lg:grid-cols-12 lg:gap-8"
            aria-hidden
          >
            <p className="col-span-3 font-heading text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {copy.columns.type}
            </p>
            <p className="col-span-4 font-heading text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {copy.columns.value}
            </p>
            <p className="col-span-5 font-heading text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {copy.columns.examples}
            </p>
          </div>

          <ul>
            {copy.rows.map((row) => (
              <li
                key={row.id}
                className="partner-route relative border-b border-border py-7 pl-5 transition-colors hover:bg-background/60 sm:pl-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8 lg:py-6 lg:pl-4"
              >
                <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground lg:col-span-3 lg:text-base">
                  {row.type}
                </h3>
                <p className="mt-2 text-base leading-7 text-foreground/85 lg:col-span-4 lg:mt-0">
                  <span className="mb-1 block text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase lg:hidden">
                    {copy.columns.value}
                  </span>
                  {row.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground lg:col-span-5 lg:mt-0 lg:text-base lg:leading-7">
                  <span className="mb-1 block text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase lg:hidden">
                    {copy.columns.examples}
                  </span>
                  {row.examples}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
