"use client";

import { ArchiveIcon, DownloadIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { getBackupDownloadUrl } from "@/actions/backups";
import { BackupHistoryFilters } from "@/components/dashboard/backup-history-filters";
import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import { AdminSortableHead } from "@/components/dashboard/admin-sortable-head";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import type { BackupListRow } from "@/data/backups";
import { formatAdminDateTime } from "@/lib/admin-format";
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
import {
  BACKUP_DEFAULT_PAGE_SIZE,
  BACKUP_PAGE_SIZES,
  backupListFilterParams,
  type BackupListQuery,
} from "@/validations/backup";

function formatBytes(size: number | null): string {
  if (size == null || size < 0) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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

const STATUS_LABELS: Record<BackupListRow["status"], string> = {
  completed: "Completed",
  failed: "Failed",
  processing: "Processing",
  pending: "Pending",
};

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
  const listFilters = backupListFilterParams(query);
  const sortFilters = {
    status: listFilters.status,
    scope: listFilters.scope,
    pageSize: listFilters.pageSize,
  };
  const isFiltered = adminListFiltersActive({
    status: listFilters.status,
    scope: listFilters.scope,
  });

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
        filters={<BackupHistoryFilters query={query} />}
        header={
          <TableRow>
            <AdminSortableHead
              label="Date"
              sortKey="created_at"
              currentSort={query.sort}
              currentDir={query.dir}
              basePath={ROUTES.adminBackup}
              filters={sortFilters}
            />
            <AdminSortableHead
              label="Scope"
              sortKey="scope"
              currentSort={query.sort}
              currentDir={query.dir}
              basePath={ROUTES.adminBackup}
              filters={sortFilters}
            />
            <AdminSortableHead
              label="Size"
              sortKey="file_size"
              currentSort={query.sort}
              currentDir={query.dir}
              basePath={ROUTES.adminBackup}
              filters={sortFilters}
            />
            <AdminSortableHead
              label="Status"
              sortKey="status"
              currentSort={query.sort}
              currentDir={query.dir}
              basePath={ROUTES.adminBackup}
              filters={sortFilters}
            />
            <TableHead>Actor</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        }
        isEmpty={backups.length === 0}
        emptyColSpan={6}
        empty={
          <AdminEmptyState
            icon={ArchiveIcon}
            isFiltered={isFiltered}
            emptyTitle="No backups yet"
            emptyDescription="Create a full DB or storage backup above. Scheduled automated runs will also appear here."
            noResultsTitle="No backups found"
            noResultsDescription="Try changing the status or scope filters."
          />
        }
        pagination={{
          basePath: ROUTES.adminBackup,
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages,
          filters: listFilters,
          pageSizeOptions: BACKUP_PAGE_SIZES,
          defaultPageSize: BACKUP_DEFAULT_PAGE_SIZE,
        }}
      >
        {backups.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="whitespace-nowrap">
              {formatAdminDateTime(row.created_at)}
            </TableCell>
            <TableCell className="max-w-[14rem] truncate" title={scopeLabel(row)}>
              {scopeLabel(row)}
            </TableCell>
            <TableCell>{formatBytes(row.file_size)}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(row.status)}>
                {STATUS_LABELS[row.status]}
              </Badge>
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
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </AdminDataTable>
    </section>
  );
}
