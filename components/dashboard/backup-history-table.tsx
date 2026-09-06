"use client";

import { DownloadIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { getBackupDownloadUrl } from "@/actions/backups";
import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import type { BackupListRow } from "@/data/backups";
import {
  BACKUP_DEFAULT_PAGE_SIZE,
  BACKUP_PAGE_SIZES,
  backupListFilterParams,
  type BackupListQuery,
} from "@/validations/backup";

function formatBytes(size: number | null): string {
  if (size == null || size < 0) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function scopeLabel(row: BackupListRow): string {
  if (row.scope === "automated") return "Automated";
  if (row.scope === "full") return "Full DB";
  if (row.scope === "storage") return "Storage";
  const tables = row.target_tables ?? [];
  if (tables.length === 0) return "Tables";
  if (tables.length <= 2) return tables.join(", ");
  return `${tables.slice(0, 2).join(", ")} +${tables.length - 2}`;
}

function statusVariant(
  status: BackupListRow["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "failed":
      return "destructive";
    case "processing":
      return "secondary";
    default:
      return "outline";
  }
}

function BackupDownloadButton({ backupId }: { backupId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="min-h-11"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await getBackupDownloadUrl(backupId);
          if (result.status === "error") {
            toast.error(result.message);
            return;
          }
          window.location.assign(result.url);
        });
      }}
    >
      <DownloadIcon className="size-4" />
      {pending ? "Preparing…" : "Re-download"}
    </Button>
  );
}

type BackupHistoryTableProps = {
  backups: BackupListRow[];
  total: number;
  totalPages: number;
  query: BackupListQuery;
};

export function BackupHistoryTable({
  backups,
  total,
  totalPages,
  query,
}: BackupHistoryTableProps) {
  return (
    <section className="grid gap-3">
      <div className="grid gap-1">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Backup history
        </h2>
        <p className="text-sm text-muted-foreground">
          Past exports stored in private R2. Re-download uses a short-lived signed
          URL.
        </p>
      </div>

      <AdminDataTable
        header={
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        }
        isEmpty={backups.length === 0}
        emptyColSpan={7}
        empty={
          <div className="grid gap-1 py-6">
            <p className="font-medium">No backups yet</p>
            <p className="text-sm text-muted-foreground">
              Create a full, table, or storage backup above. Weekly automated
              runs will also appear here.
            </p>
          </div>
        }
        pagination={{
          basePath: ROUTES.backup,
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages,
          filters: backupListFilterParams(query),
          pageSizeOptions: BACKUP_PAGE_SIZES,
          defaultPageSize: BACKUP_DEFAULT_PAGE_SIZE,
        }}
      >
        {backups.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="whitespace-nowrap">
              {formatDate(row.created_at)}
            </TableCell>
            <TableCell className="max-w-[14rem] truncate" title={scopeLabel(row)}>
              {scopeLabel(row)}
            </TableCell>
            <TableCell className="uppercase">{row.format}</TableCell>
            <TableCell>{formatBytes(row.file_size)}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
            </TableCell>
            <TableCell>
              {row.scope === "automated"
                ? "System"
                : (row.actor_name ?? "Admin")}
            </TableCell>
            <TableCell className="text-right">
              {row.status === "completed" && row.file_path ? (
                <BackupDownloadButton backupId={row.id} />
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </AdminDataTable>
    </section>
  );
}
