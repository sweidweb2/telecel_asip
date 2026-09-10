"use client";

import Link from "next/link";
import { Loader2Icon, XIcon } from "lucide-react";

import { AdminFilterSelectValue } from "@/components/dashboard/admin-filter-select-value";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import { cn } from "@/lib/utils";
import type { BackupListQuery } from "@/validations/backup";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

const SCOPE_LABELS: Record<string, string> = {
  full: "Full DB",
  storage: "Storage",
  automated: "Automated",
  tables: "Tables",
};

export function BackupHistoryFilters({ query }: { query: BackupListQuery }) {
  const { isPending, navigate, clearSearchLocal } = useAdminListFilters({
    basePath: ROUTES.adminBackup,
    search: "",
  });

  const hasFilters = query.status !== "all" || query.scope !== "all";

  return (
    <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:flex-wrap sm:items-center">
      <Label htmlFor="backup-history-status" className="sr-only">
        Status
      </Label>
      <Select
        value={query.status}
        onValueChange={(value) => {
          if (value) navigate({ status: value });
        }}
        disabled={isPending}
      >
        <SelectTrigger
          id="backup-history-status"
          className="min-h-11 w-full sm:min-h-8 sm:w-40"
        >
          <AdminFilterSelectValue
            label="Status"
            optionLabels={STATUS_LABELS}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>

      <Label htmlFor="backup-history-scope" className="sr-only">
        Scope
      </Label>
      <Select
        value={query.scope}
        onValueChange={(value) => {
          if (value) navigate({ scope: value });
        }}
        disabled={isPending}
      >
        <SelectTrigger
          id="backup-history-scope"
          className="min-h-11 w-full sm:min-h-8 sm:w-40"
        >
          <AdminFilterSelectValue label="Scope" optionLabels={SCOPE_LABELS} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All scopes</SelectItem>
          <SelectItem value="full">Full DB</SelectItem>
          <SelectItem value="storage">Storage</SelectItem>
          <SelectItem value="automated">Automated</SelectItem>
          <SelectItem value="tables">Tables</SelectItem>
        </SelectContent>
      </Select>

      {isPending ? (
        <Loader2Icon
          className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none"
          aria-hidden
        />
      ) : null}

      {hasFilters ? (
        <Link
          href={ROUTES.adminBackup}
          aria-disabled={isPending}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "min-h-11 shrink-0 sm:min-h-8",
            isPending && "pointer-events-none opacity-50",
          )}
          onClick={clearSearchLocal}
        >
          <XIcon />
          Clear
        </Link>
      ) : null}
    </div>
  );
}
