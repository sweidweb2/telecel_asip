import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { UserListQuery } from "@/validations/users";

function pageHref(query: UserListQuery, page: number): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(query.pageSize));
  if (query.search) params.set("search", query.search);
  if (query.role !== "all") params.set("role", query.role);
  return `${ROUTES.users}?${params.toString()}`;
}

export function UsersPagination({
  query,
  totalPages,
}: {
  query: UserListQuery;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const current = Math.min(query.page, totalPages);
  const visible = Array.from(
    new Set([1, current - 1, current, current + 1, totalPages]),
  ).filter((page) => page >= 1 && page <= totalPages);

  return (
    <Pagination className="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={current > 1 ? pageHref(query, current - 1) : undefined}
            aria-disabled={current === 1}
            className={cn(
              "min-h-11 min-w-11 sm:min-h-8 sm:min-w-8",
              current === 1 && "pointer-events-none opacity-50",
            )}
          />
        </PaginationItem>
        {visible.map((page, index) => {
          const previous = visible[index - 1];
          return (
            <span className="contents" key={page}>
              {previous && page - previous > 1 ? (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : null}
              <PaginationItem>
                <PaginationLink
                  href={pageHref(query, page)}
                  isActive={page === current}
                  aria-label={`Go to page ${page}`}
                  className="min-h-11 min-w-11 sm:min-h-8 sm:min-w-8"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            </span>
          );
        })}
        <PaginationItem>
          <PaginationNext
            href={
              current < totalPages ? pageHref(query, current + 1) : undefined
            }
            aria-disabled={current === totalPages}
            className={cn(
              "min-h-11 min-w-11 sm:min-h-8 sm:min-w-8",
              current === totalPages && "pointer-events-none opacity-50",
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
