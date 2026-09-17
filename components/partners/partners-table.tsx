"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { HandshakeIcon, ImageOffIcon } from "lucide-react";

import { AdminClickableRow } from "@/components/dashboard/admin-clickable-row";
import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import {
  AdminRowNumberCell,
  AdminRowNumberHead,
} from "@/components/dashboard/admin-row-number";
import { PartnerRowActions } from "@/components/partners/partner-row-actions";
import {
  PartnerActiveToggle,
  PartnerLogoPermissionToggle,
} from "@/components/partners/partner-flag-toggles";
import { PartnersFilters } from "@/components/partners/partners-filters";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { PARTNER_TYPE_LABELS } from "@/constants/partner-types";
import { partnerDetailPath, ROUTES } from "@/constants/routes";
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
import type { PartnerListItem } from "@/types/partner";
import { PARTNER_PAGE_SIZE, type PartnerListQuery } from "@/validations/partner";

function LogoCell({ partner }: { partner: PartnerListItem }) {
  if (!partner.logo_url) {
    return (
      <span className="flex size-9 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground">
        <ImageOffIcon className="size-4" />
      </span>
    );
  }

  return (
    <span className="flex size-9 items-center justify-center overflow-hidden rounded-md border bg-background">
      <Image
        src={partner.logo_url}
        alt={`${partner.name} logo`}
        width={36}
        height={36}
        sizes="36px"
        className="size-full object-contain"
      />
    </span>
  );
}

export function PartnersTable({
  partners,
  total,
  totalPages,
  query,
}: {
  partners: PartnerListItem[];
  total: number;
  totalPages: number;
  query: PartnerListQuery;
}) {
  const router = useRouter();
  const listFilters = {
    search: query.search,
    type: query.type === "all" ? undefined : query.type,
    status: query.status === "all" ? undefined : query.status,
  };
  const isFiltered = adminListFiltersActive(listFilters);

  return (
    <AdminDataTable
      filters={<PartnersFilters query={query} />}
      header={
        <TableRow>
          <AdminRowNumberHead />
          <TableHead className="w-14">Logo</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Organisation</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Logo permission</TableHead>
          <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={partners.length === 0}
      emptyColSpan={8}
      empty={
        <AdminEmptyState
          icon={HandshakeIcon}
          isFiltered={isFiltered}
          emptyTitle="No partners yet"
          emptyDescription="Create the first partner to show on the site."
          noResultsTitle="No partners found"
          noResultsDescription="Try changing the filters or clearing search."
          createHref={ROUTES.partnersNew}
          createLabel="New partner"
        />
      }
      pagination={{
        basePath: ROUTES.partners,
        page: query.page,
        pageSize: PARTNER_PAGE_SIZE,
        total,
        totalPages,
        filters: listFilters,
      }}
    >
      {partners.map((partner, index) => (
        <AdminClickableRow
          key={partner.id}
          ariaLabel={`Edit partner ${partner.name}`}
          onActivate={() => router.push(partnerDetailPath(partner.id))}
        >
          <AdminRowNumberCell
            page={query.page}
            pageSize={PARTNER_PAGE_SIZE}
            index={index}
          />
          <TableCell>
            <LogoCell partner={partner} />
          </TableCell>
          <TableCell className="max-w-[10rem] font-medium sm:max-w-[14rem]">
            <Link
              href={partnerDetailPath(partner.id)}
              title={partner.name}
              className="block truncate hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {partner.name}
            </Link>
          </TableCell>
          <TableCell className="max-w-[10rem] text-muted-foreground sm:max-w-[14rem]">
            <span className="block truncate" title={partner.org ?? undefined}>
              {partner.org || "-"}
            </span>
          </TableCell>
          <TableCell className="max-w-[12rem]">
            <Badge
              variant="secondary"
              className="max-w-full"
              title={PARTNER_TYPE_LABELS[partner.type]}
            >
              <span className="truncate">
                {PARTNER_TYPE_LABELS[partner.type]}
              </span>
            </Badge>
          </TableCell>
          <TableCell
            className="whitespace-nowrap"
            onClick={(event) => event.stopPropagation()}
          >
            <PartnerActiveToggle
              partnerId={partner.id}
              isActive={partner.is_active}
            />
          </TableCell>
          <TableCell
            className="whitespace-nowrap"
            onClick={(event) => event.stopPropagation()}
          >
            <PartnerLogoPermissionToggle
              partnerId={partner.id}
              logoPermission={partner.logo_permission}
            />
          </TableCell>
          <TableCell
            className="pr-4 whitespace-nowrap"
            onClick={(event) => event.stopPropagation()}
          >
            <PartnerRowActions partner={partner} />
          </TableCell>
        </AdminClickableRow>
      ))}
    </AdminDataTable>
  );
}
