"use client";

import { useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPaginationItems } from "@/lib/pagination-window";
import { cn } from "@/lib/utils";

export type AdminPaginationProps = {
  /** Dashboard route the pagination links back to, e.g. `ROUTES.users`. */
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  /** Filters preserved across pages; empty/undefined values are dropped. */
  filters?: Record<string, string | undefined>;
  /** When set, shows a rows-per-page control. */
  pageSizeOptions?: readonly number[];
  /** Omitted from the URL when the current size matches this value. */
  defaultPageSize?: number;
};

export function adminPaginationHref(
  basePath: string,
  page: number,
  filters?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  for (const [key, value] of Object.entries(filters ?? {})) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Result counter plus numbered page controls shared by the admin list tables.
 */
export function AdminPagination({
  basePath,
  page,
  pageSize,
  total,
  totalPages,
  filters,
  pageSizeOptions,
  defaultPageSize,
}: AdminPaginationProps) {
  const current = Math.min(page, Math.max(totalPages, 1));
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);
  const pageItems = getPaginationItems(current, totalPages);

  function pageHref(target: number): string {
    return adminPaginationHref(basePath, target, filters);
  }

  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-sm text-muted-foreground">
          {total === 0 ? "No results" : `Showing ${from}–${to} of ${total}`}
        </p>
        {pageSizeOptions && pageSizeOptions.length > 0 ? (
          <AdminPageSizeSelect
            basePath={basePath}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            defaultPageSize={defaultPageSize}
            filters={filters}
          />
        ) : null}
      </div>

      {totalPages > 1 ? (
        <Pagination className="mx-0 w-auto justify-start lg:justify-end">
          <PaginationContent className="flex-wrap justify-start gap-1 lg:justify-end">
            <PaginationItem>
              <PaginationPrevious
                href={current > 1 ? pageHref(current - 1) : undefined}
                aria-disabled={current === 1}
                className={cn(
                  "min-h-11 sm:min-h-8",
                  current === 1 && "pointer-events-none opacity-50",
                )}
              />
            </PaginationItem>
            {pageItems.map((item, index) =>
              item === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    href={pageHref(item)}
                    isActive={item === current}
                    aria-label={`Page ${item} of ${totalPages}`}
                    className="min-h-11 min-w-11 sm:min-h-8 sm:min-w-9"
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href={current < totalPages ? pageHref(current + 1) : undefined}
                aria-disabled={current === totalPages}
                className={cn(
                  "min-h-11 sm:min-h-8",
                  current === totalPages && "pointer-events-none opacity-50",
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}

function AdminPageSizeSelect({
  basePath,
  pageSize,
  pageSizeOptions,
  defaultPageSize,
  filters,
}: {
  basePath: string;
  pageSize: number;
  pageSizeOptions: readonly number[];
  defaultPageSize?: number;
  filters?: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const selectId = "admin-table-page-size";

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={selectId} className="text-sm whitespace-nowrap text-muted-foreground">
        Per page
      </Label>
      <Select
        value={String(pageSize)}
        disabled={isPending}
        onValueChange={(value) => {
          if (!value) return;
          const nextSize = Number(value);
          const nextFilters = {
            ...filters,
            pageSize:
              defaultPageSize != null && nextSize === defaultPageSize
                ? undefined
                : String(nextSize),
          };
          startTransition(() => {
            router.replace(adminPaginationHref(basePath, 1, nextFilters), {
              scroll: false,
            });
          });
        }}
      >
        <SelectTrigger
          id={selectId}
          className="min-h-11 w-[5.5rem] sm:min-h-8"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pageSizeOptions.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
