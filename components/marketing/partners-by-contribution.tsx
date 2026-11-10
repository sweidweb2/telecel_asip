import Image from "next/image";

import { cn } from "@/lib/utils";
import type { PartnersPageCopy } from "@/types/marketing-page";
import type { PartnerPublicItem } from "@/types/partner";

/** Group rule colours walk the ASIP spectrum. */
const GROUP_ACCENTS = [
  "bg-brand",
  "bg-asip-magenta",
  "bg-asip-coral",
  "bg-asip-mint",
  "bg-asip-ink",
  "bg-brand",
] as const;

type PartnersByContributionProps = {
  partners: PartnerPublicItem[];
  typeRows: PartnersPageCopy["types"]["rows"];
  bringsLabel: string;
  className?: string;
};

function PartnerMark({ partner }: { partner: PartnerPublicItem }) {
  const label = partner.org ? `${partner.name} - ${partner.org}` : partner.name;
  const mark = partner.logo_url ? (
    <Image
      src={partner.logo_url}
      alt={`${label} logo`}
      width={200}
      height={64}
      sizes="9rem"
      className="h-auto max-h-9 w-auto max-w-full object-contain sm:max-h-10 sm:max-w-[8rem] opacity-80 grayscale transition-[filter,opacity] duration-300 group-hover:opacity-100 group-hover:grayscale-0"
    />
  ) : (
    <span className="text-sm font-semibold tracking-tight text-foreground">
      {partner.name}
    </span>
  );

  const shell = (
    <span className="flex min-h-14 min-w-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-card px-3 py-2 sm:px-4 transition-colors duration-300 group-hover:border-foreground/25">
      {mark}
    </span>
  );

  return partner.link ? (
    <a
      href={partner.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {shell}
    </a>
  ) : (
    <span className="group block">{shell}</span>
  );
}

/**
 * Partners grouped by what they bring to founders (capital, technology,
 * markets, expertise…). The contribution leads; logos are small, muted
 * supporting proof — credible without becoming a logo wall.
 * Logos only appear when the `partners_public` view grants permission.
 */
export function PartnersByContribution({
  partners,
  typeRows,
  bringsLabel,
  className,
}: PartnersByContributionProps) {
  const groups = typeRows
    .map((row) => ({
      row,
      members: partners.filter((partner) => partner.type === row.id),
    }))
    .filter((group) => group.members.length > 0);

  if (groups.length === 0) return null;

  return (
    <ul className={cn("divide-y divide-border border-y border-border", className)}>
      {groups.map(({ row, members }, index) => (
        <li
          key={row.id}
          data-reveal="fade"
          className="grid gap-5 py-7 sm:py-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10"
        >
          <div className="relative pl-5">
            <span
              aria-hidden
              className={cn(
                "absolute top-1 bottom-1 left-0 w-1 rounded-full",
                GROUP_ACCENTS[index % GROUP_ACCENTS.length],
              )}
            />
            <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground">
              {row.type}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              <span className="font-semibold text-foreground">{bringsLabel} </span>
              {row.examples || row.value}
            </p>
          </div>
          <ul className="grid grid-cols-2 content-start gap-3 sm:grid-cols-3">
            {members.map((partner) => (
              <li key={partner.id} className="min-w-0">
                <PartnerMark partner={partner} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
