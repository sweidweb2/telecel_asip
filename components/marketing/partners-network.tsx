import Image from "next/image";

import { partnerLabelsFor } from "@/components/marketing/partner-labels";
import type { Locale } from "@/constants/locales";
import { startupInitials } from "@/lib/startup-display";
import type { PartnerPublicItem, PartnerType } from "@/types/partner";
import type { PartnersPageCopy } from "@/types/marketing-page";
import { cn } from "@/lib/utils";

type TypeLabels = Partial<Record<PartnerType, string>>;

type PartnerGroup = {
  key: string;
  title: string;
  partners: PartnerPublicItem[];
};

/**
 * Groups in copy order. Any type without a copy row still gets rendered under a
 * trailing group — a new `partner_type` value must never make partners vanish
 * from the public page.
 */
function groupByType(
  partners: PartnerPublicItem[],
  order: PartnerType[],
  labels: TypeLabels,
  fallbackTitle: string,
): PartnerGroup[] {
  const groups: PartnerGroup[] = [];
  const known = new Set(order);

  for (const type of order) {
    const members = partners.filter((partner) => partner.type === type);
    if (members.length > 0) {
      groups.push({ key: type, title: labels[type] ?? type, partners: members });
    }
  }

  const ungrouped = partners.filter((partner) => !known.has(partner.type));
  if (ungrouped.length > 0) {
    groups.push({ key: "other", title: fallbackTitle, partners: ungrouped });
  }

  return groups;
}

function PartnerTile({ partner }: { partner: PartnerPublicItem }) {
  const label = partner.org ? `${partner.name} — ${partner.org}` : partner.name;

  const body = partner.logo_url ? (
    <Image
      src={partner.logo_url}
      alt={`${label} logo`}
      width={200}
      height={64}
      sizes="(max-width: 640px) 40vw, (max-width: 1024px) 22vw, 200px"
      className="h-auto max-h-10 w-auto max-w-[9.5rem] object-contain sm:max-h-12 sm:max-w-[11rem]"
    />
  ) : (
    <span className="flex min-w-0 flex-col items-center gap-1.5 text-center">
      <span
        aria-hidden
        className="flex size-9 items-center justify-center rounded-full bg-muted font-heading text-xs font-semibold tracking-tight"
      >
        {startupInitials(partner.name)}
      </span>
      <span className="line-clamp-2 text-sm font-medium leading-5">
        {label}
      </span>
    </span>
  );

  return (
    <li className="flex min-h-20 items-center justify-center">
      {partner.link ? (
        <a
          href={partner.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex min-h-11 w-full items-center justify-center rounded-lg px-2 py-2 transition-opacity hover:opacity-80"
        >
          {body}
        </a>
      ) : (
        body
      )}
    </li>
  );
}

function PartnerTypeGroup({
  title,
  partners,
}: {
  title: string;
  partners: PartnerPublicItem[];
}) {
  return (
    <div>
      <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-6 grid grid-cols-2 items-center gap-x-8 gap-y-8 sm:grid-cols-3 sm:gap-x-10 sm:gap-y-10 lg:grid-cols-4">
        {partners.map((partner) => (
          <PartnerTile key={partner.id} partner={partner} />
        ))}
      </ul>
    </div>
  );
}

type PartnersNetworkProps = {
  locale: Locale;
  partners: PartnerPublicItem[];
  typeRows: PartnersPageCopy["types"]["rows"];
  className?: string;
};

/**
 * Partners grouped by type under the bilingual labels already defined in
 * `constants/partners-copy.ts`.
 */
export function PartnersNetwork({
  locale,
  partners,
  typeRows,
  className,
}: PartnersNetworkProps) {
  const labels = partnerLabelsFor(locale);

  if (partners.length === 0) {
    return (
      <p className={cn("text-center text-muted-foreground", className)}>
        {labels.emptyState}
      </p>
    );
  }

  const typeLabels: TypeLabels = Object.fromEntries(
    typeRows.map((row) => [row.id, row.type]),
  );
  const order = typeRows.map((row) => row.id);
  const groups = groupByType(partners, order, typeLabels, labels.otherTitle);

  return (
    <div className={cn("mx-auto max-w-5xl space-y-12 sm:space-y-14", className)}>
      {groups.map((group) => (
        <PartnerTypeGroup
          key={group.key}
          title={group.title}
          partners={group.partners}
        />
      ))}
    </div>
  );
}
