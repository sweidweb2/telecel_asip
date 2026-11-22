import { cn } from "@/lib/utils";
import type { PartnersPageCopy } from "@/types/marketing-page";

type PartnersTypesSectionProps = {
  copy: PartnersPageCopy["types"];
  className?: string;
};

/**
 * Partner contribution routes — numbered list rhythm aligned with the home
 * ecosystem module (value before logos).
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
        "border-b border-border bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28",
        className,
      )}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h2
            id="partners-types-heading"
            className="font-heading text-4xl font-semibold tracking-tight text-balance text-asip-ink sm:text-5xl"
          >
            {copy.title}
          </h2>
          {copy.description ? (
            <p className="mt-6 max-w-lg text-lg leading-8 text-asip-ink/75">
              {copy.description}
            </p>
          ) : null}
        </div>

        <ol className="divide-y divide-asip-ink/10 border-y border-asip-ink/10 lg:col-span-7">
          {copy.rows.map((row, index) => (
            <li
              key={row.id}
              className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 py-5 sm:grid-cols-[3rem_1fr_1.2fr] sm:items-baseline sm:gap-x-6"
            >
              <span
                aria-hidden
                className="font-heading text-sm font-semibold tracking-tight text-asip-sky"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-heading text-lg font-semibold tracking-tight text-asip-ink sm:text-xl">
                {row.type}
              </h3>
              <div className="col-span-2 space-y-2 sm:col-span-1 sm:col-start-3">
                <p className="text-base leading-7 text-asip-ink/75">{row.value}</p>
                {row.examples ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {row.examples}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
