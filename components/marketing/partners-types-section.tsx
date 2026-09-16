import { cn } from "@/lib/utils";
import type { PartnersPageCopy } from "@/types/marketing-page";

type PartnersTypesSectionProps = {
  copy: PartnersPageCopy["types"];
  className?: string;
};

/**
 * Six concise engagement routes without the previous three-column table.
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

        <div className="mt-8 sm:mt-10">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {copy.rows.map((row) => (
              <li
                key={row.id}
                className="partner-route rounded-2xl border border-border bg-background p-5 transition-all hover:-translate-y-1 hover:shadow-md sm:p-6"
              >
                <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                  {row.type}
                </h3>
                <p className="mt-3 text-sm leading-6 text-foreground/85 sm:text-base sm:leading-7">
                  {row.value}
                </p>
                <p className="mt-3 border-t border-border pt-3 text-sm leading-6 text-muted-foreground">
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
