"use client";

import { useTransition } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

import { TableHead } from "@/components/ui/table";
import type { ListSortDir } from "@/lib/admin/list-sort";
import { cn } from "@/lib/utils";

type AdminSortableHeadProps = {
  label: string;
  sortKey: string;
  currentSort: string;
  currentDir: ListSortDir;
  basePath: string;
  /** Other query params to preserve (search, role, status, …). */
  filters?: Record<string, string | undefined>;
  className?: string;
};

function defaultDirForSortKey(sortKey: string): ListSortDir {
  return sortKey.endsWith("_at") ? "desc" : "asc";
}

function nextSortDir(
  sortKey: string,
  currentSort: string,
  currentDir: ListSortDir,
): ListSortDir {
  if (sortKey === currentSort) {
    return currentDir === "asc" ? "desc" : "asc";
  }
  return defaultDirForSortKey(sortKey);
}

function sortHref(
  basePath: string,
  sortKey: string,
  dir: ListSortDir,
  filters?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters ?? {})) {
    if (value) params.set(key, value);
  }
  params.set("sort", sortKey);
  params.set("dir", dir);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Table header button that toggles list sort via `sort` / `dir` URL params.
 * Resets to page 1 on each change.
 */
export function AdminSortableHead({
  label,
  sortKey,
  currentSort,
  currentDir,
  basePath,
  filters,
  className,
}: AdminSortableHeadProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isActive = currentSort === sortKey;
  const ariaSort = isActive
    ? currentDir === "asc"
      ? "ascending"
      : "descending"
    : "none";

  const Icon = !isActive
    ? ChevronsUpDownIcon
    : currentDir === "asc"
      ? ChevronUpIcon
      : ChevronDownIcon;

  function handleClick() {
    const dir = nextSortDir(sortKey, currentSort, currentDir);
    const href = sortHref(basePath, sortKey, dir, filters);
    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  return (
    <TableHead aria-sort={ariaSort} className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "inline-flex min-h-11 items-center gap-1 rounded-md px-1 text-left font-medium text-foreground hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
        )}
      >
        <span>{label}</span>
        <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
      </button>
    </TableHead>
  );
}
