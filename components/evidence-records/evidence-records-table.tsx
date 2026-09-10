"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { ShieldCheckIcon } from "lucide-react";

import { AdminClickableRow } from "@/components/dashboard/admin-clickable-row";
import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import {
  AdminRowNumberCell,
  AdminRowNumberHead,
} from "@/components/dashboard/admin-row-number";
import { EvidenceRecordsFilters } from "@/components/evidence-records/evidence-records-filters";
import { EvidenceRowActions } from "@/components/evidence-records/evidence-row-actions";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import {
  EVIDENCE_PERMISSION_LABELS,
  EVIDENCE_STATUS_LABELS,
} from "@/constants/evidence-labels";
import { evidenceDetailPath, ROUTES } from "@/constants/routes";
import { formatAdminDate } from "@/lib/admin-format";
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
import type { EvidenceListItem } from "@/types/evidence-record";
import {
  EVIDENCE_PAGE_SIZE,
  type EvidenceListQuery,
} from "@/validations/evidence-record";

function ownerDisplay(record: EvidenceListItem): string {
  if (record.owner?.full_name?.trim()) return record.owner.full_name;
  if (record.owner?.email) return record.owner.email;
  return "-";
}

export function EvidenceRecordsTable({
  records,
  total,
  totalPages,
  query,
}: {
  records: EvidenceListItem[];
  total: number;
  totalPages: number;
  query: EvidenceListQuery;
}) {
  const router = useRouter();
  const listFilters = {
    search: query.search,
    status: query.status === "all" ? undefined : query.status,
    permission: query.permission === "all" ? undefined : query.permission,
  };
  const isFiltered = adminListFiltersActive(listFilters);

  return (
    <AdminDataTable
      filters={<EvidenceRecordsFilters query={query} />}
      header={
        <TableRow>
          <AdminRowNumberHead />
          <TableHead>Primary source</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Permission</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Period</TableHead>
          <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={records.length === 0}
      emptyColSpan={7}
      empty={
        <AdminEmptyState
          icon={ShieldCheckIcon}
          isFiltered={isFiltered}
          emptyTitle="No evidence records yet"
          emptyDescription="Create the first evidence record to back impact claims."
          noResultsTitle="No evidence records found"
          noResultsDescription="Try changing the filters or clearing search."
          createHref={ROUTES.evidenceNew}
          createLabel="New evidence"
        />
      }
      pagination={{
        basePath: ROUTES.evidence,
        page: query.page,
        pageSize: EVIDENCE_PAGE_SIZE,
        total,
        totalPages,
        filters: listFilters,
      }}
    >
      {records.map((record, index) => (
        <AdminClickableRow
          key={record.id}
          ariaLabel={`Edit evidence ${record.primary_source}`}
          onActivate={() => router.push(evidenceDetailPath(record.id))}
        >
          <AdminRowNumberCell
            page={query.page}
            pageSize={EVIDENCE_PAGE_SIZE}
            index={index}
          />
          <TableCell className="max-w-[14rem] font-medium sm:max-w-[20rem]">
            <Link
              href={evidenceDetailPath(record.id)}
              title={record.primary_source}
              className="block truncate hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {record.primary_source}
            </Link>
          </TableCell>
          <TableCell className="whitespace-nowrap">
            <Badge
              variant={record.status === "verified" ? "default" : "outline"}
            >
              {EVIDENCE_STATUS_LABELS[record.status]}
            </Badge>
          </TableCell>
          <TableCell className="max-w-[12rem]">
            <Badge
              variant="secondary"
              className="max-w-full"
              title={EVIDENCE_PERMISSION_LABELS[record.permission]}
            >
              <span className="truncate">
                {EVIDENCE_PERMISSION_LABELS[record.permission]}
              </span>
            </Badge>
          </TableCell>
          <TableCell className="max-w-[10rem] text-muted-foreground sm:max-w-[14rem]">
            <span className="block truncate" title={ownerDisplay(record)}>
              {ownerDisplay(record)}
            </span>
          </TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground">
            {formatAdminDate(record.measurement_period_start)}
            {" – "}
            {formatAdminDate(record.measurement_period_end)}
          </TableCell>
          <TableCell
            className="pr-4 whitespace-nowrap"
            onClick={(event) => event.stopPropagation()}
          >
            <EvidenceRowActions record={record} />
          </TableCell>
        </AdminClickableRow>
      ))}
    </AdminDataTable>
  );
}
