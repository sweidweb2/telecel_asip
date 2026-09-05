"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { format } from "date-fns";
import { ShieldCheckIcon } from "lucide-react";

import { EvidenceRecordsFilters } from "@/components/evidence-records/evidence-records-filters";
import { EvidenceRowActions } from "@/components/evidence-records/evidence-row-actions";
import { AdminPagination } from "@/components/dashboard/admin-pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EVIDENCE_PERMISSION_LABELS,
  EVIDENCE_STATUS_LABELS,
} from "@/constants/evidence-labels";
import { evidenceDetailPath, ROUTES } from "@/constants/routes";
import type {
  EvidenceListItem,
  EvidenceOwnerOption,
} from "@/types/evidence-record";
import {
  EVIDENCE_PAGE_SIZE,
  type EvidenceListQuery,
} from "@/validations/evidence-record";

function ownerDisplay(record: EvidenceListItem): string {
  if (record.owner?.full_name?.trim()) return record.owner.full_name;
  if (record.owner?.email) return record.owner.email;
  return "—";
}

export function EvidenceRecordsTable({
  records,
  total,
  totalPages,
  query,
  owners,
  defaultOwnerId,
}: {
  records: EvidenceListItem[];
  total: number;
  totalPages: number;
  query: EvidenceListQuery;
  owners: EvidenceOwnerOption[];
  defaultOwnerId: string;
}) {
  const router = useRouter();

  return (
    <Card className="min-w-0 gap-0 overflow-hidden py-0">
      <EvidenceRecordsFilters query={query} />

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Primary source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permission</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 whitespace-normal">
                      <span className="flex size-10 items-center justify-center rounded-full bg-muted">
                        <ShieldCheckIcon className="size-5 text-muted-foreground" />
                      </span>
                      <p className="font-medium">No evidence records found</p>
                      <p className="text-sm text-muted-foreground">
                        Try changing the filters, or create a new evidence
                        record.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow
                    key={record.id}
                    className="cursor-pointer"
                    onClick={() => router.push(evidenceDetailPath(record.id))}
                  >
                    <TableCell className="max-w-[14rem] pl-4 font-medium sm:max-w-[20rem]">
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
                        variant={
                          record.status === "verified" ? "default" : "outline"
                        }
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
                      <span
                        className="block truncate"
                        title={ownerDisplay(record)}
                      >
                        {ownerDisplay(record)}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(
                        new Date(record.measurement_period_start),
                        "MMM d, yyyy",
                      )}
                      {" – "}
                      {format(
                        new Date(record.measurement_period_end),
                        "MMM d, yyyy",
                      )}
                    </TableCell>
                    <TableCell
                      className="pr-4 whitespace-nowrap"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <EvidenceRowActions
                        record={record}
                        owners={owners}
                        defaultOwnerId={defaultOwnerId}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="border-t bg-transparent px-4 py-3">
        <AdminPagination
          basePath={ROUTES.evidence}
          page={query.page}
          pageSize={EVIDENCE_PAGE_SIZE}
          total={total}
          totalPages={totalPages}
          filters={{
            search: query.search,
            status: query.status === "all" ? undefined : query.status,
            permission:
              query.permission === "all" ? undefined : query.permission,
          }}
        />
      </CardFooter>
    </Card>
  );
}
