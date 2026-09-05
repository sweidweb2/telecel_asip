import {
  CalendarIcon,
  ExternalLinkIcon,
  LinkIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";

import { EvidenceRowActions } from "@/components/evidence-records/evidence-row-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  EVIDENCE_PERMISSION_LABELS,
  EVIDENCE_STATUS_LABELS,
} from "@/constants/evidence-labels";
import { formatAdminDate, formatAdminDateTime } from "@/lib/admin-format";
import type {
  EvidenceDetail,
  EvidenceOwnerOption,
} from "@/types/evidence-record";

function Stat({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof LinkIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-1 text-sm break-words">{children}</dd>
      </div>
    </div>
  );
}

export function EvidenceDetailContent({
  record,
  owners,
  defaultOwnerId,
}: {
  record: EvidenceDetail;
  owners: EvidenceOwnerOption[];
  defaultOwnerId: string;
}) {
  const ownerLabel =
    record.owner?.full_name?.trim() ||
    record.owner?.email ||
    "Unknown owner";

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-3">
      <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="font-heading text-2xl tracking-tight break-words">
                Evidence record
              </CardTitle>
              <p className="mt-2 text-sm leading-6 break-words text-muted-foreground">
                {record.primary_source}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:mt-1">
              <EvidenceRowActions
                record={record}
                owners={owners}
                defaultOwnerId={defaultOwnerId}
                redirectOnDelete
              />
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Badge
                variant={record.status === "verified" ? "default" : "outline"}
              >
                <ShieldCheckIcon />
                {EVIDENCE_STATUS_LABELS[record.status]}
              </Badge>
              <Badge variant="secondary">
                {EVIDENCE_PERMISSION_LABELS[record.permission]}
              </Badge>
            </div>

            <Separator />

            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Stat icon={UserIcon} label="Owner">
                {ownerLabel}
                {record.owner?.email && record.owner.full_name ? (
                  <span className="mt-0.5 block text-muted-foreground">
                    {record.owner.email}
                  </span>
                ) : null}
              </Stat>

              <Stat icon={LinkIcon} label="Source file URL">
                {record.source_file_url ? (
                  <a
                    href={record.source_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={record.source_file_url}
                    className="flex min-w-0 max-w-full items-center gap-1 text-primary hover:underline"
                  >
                    <span className="truncate">{record.source_file_url}</span>
                    <ExternalLinkIcon className="size-3.5 shrink-0" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </Stat>

              <Stat icon={CalendarIcon} label="Measurement period">
                {formatAdminDate(record.measurement_period_start)}
                {" – "}
                {formatAdminDate(record.measurement_period_end)}
              </Stat>

              <Stat icon={CalendarIcon} label="Last verified">
                {formatAdminDate(record.last_verified_date)}
              </Stat>

              <Stat icon={CalendarIcon} label="Review date">
                {formatAdminDate(record.review_date)}
              </Stat>

              <Stat icon={CalendarIcon} label="Created">
                {formatAdminDateTime(record.created_at)}
              </Stat>

              <Stat icon={CalendarIcon} label="Last updated">
                {formatAdminDateTime(record.updated_at)}
              </Stat>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Record</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-1 text-xs">
              <dt className="font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Evidence ID
              </dt>
              <dd className="break-all font-mono">{record.id}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
