import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

type AdminPaginationProps = {
  /** Dashboard route the pagination links back to, e.g. `ROUTES.users`. */
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  /** Filters preserved across pages; empty/undefined values are dropped. */
  filters?: Record<string, string | undefined>;
};

/**
 * Result counter plus prev/next controls shared by the admin list tables.
 */
export function AdminPagination({
  basePath,
  page,
  pageSize,
  total,
  totalPages,
  filters,
}: AdminPaginationProps) {
  const current = Math.min(page, Math.max(totalPages, 1));
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);

  function pageHref(target: number): string {
    const params = new URLSearchParams();
    if (target > 1) params.set("page", String(target));
    for (const [key, value] of Object.entries(filters ?? {})) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {total === 0 ? "No results" : `Showing ${from}–${to} of ${total}`}
      </p>

      {totalPages > 1 ? (
        <Pagination className="mx-0 w-auto justify-start sm:justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={current > 1 ? pageHref(current - 1) : undefined}
                aria-disabled={current === 1}
                className={cn(
                  current === 1 && "pointer-events-none opacity-50",
                )}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href={pageHref(current)}
                isActive
                aria-label={`Page ${current} of ${totalPages}`}
              >
                {current} / {totalPages}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href={current < totalPages ? pageHref(current + 1) : undefined}
                aria-disabled={current === totalPages}
                className={cn(
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
