import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { getPaginationItems } from "@/lib/pagination-window";
import { cn } from "@/lib/utils";

type PortfolioPaginationLabels = {
  showing: string;
  previous: string;
  next: string;
};

/** Filters preserved across pages; empty/undefined values are dropped. */
type PortfolioPaginationFilters = Record<string, string | undefined>;

function pageHref(
  locale: Locale,
  page: number,
  filters: PortfolioPaginationFilters,
) {
  const base = publicPath(locale, "founders");
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function PortfolioPagination({
  locale,
  currentPage,
  totalPages,
  total,
  pageSize,
  labels,
  filters = {},
}: {
  locale: Locale;
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  labels: PortfolioPaginationLabels;
  filters?: PortfolioPaginationFilters;
}) {
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);
  const showing = labels.showing
    .replace("{from}", String(from))
    .replace("{to}", String(to))
    .replace("{total}", String(total));
  const pageItems = getPaginationItems(currentPage, totalPages);

  return (
    <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-center text-sm text-muted-foreground sm:text-left">
        {showing}
      </p>

      {totalPages > 1 ? (
        <Pagination className="mx-0 w-auto">
          <PaginationContent className="flex-wrap justify-center gap-1">
            <PaginationItem>
              <PaginationPrevious
                href={
                  currentPage > 1
                    ? pageHref(locale, currentPage - 1, filters)
                    : undefined
                }
                text={labels.previous}
                aria-disabled={currentPage === 1}
                className={cn(
                  currentPage === 1 && "pointer-events-none opacity-50",
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
                    href={pageHref(locale, item, filters)}
                    isActive={item === currentPage}
                    aria-label={`Page ${item} of ${totalPages}`}
                    className="min-w-9"
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                href={
                  currentPage < totalPages
                    ? pageHref(locale, currentPage + 1, filters)
                    : undefined
                }
                text={labels.next}
                aria-disabled={currentPage === totalPages}
                className={cn(
                  currentPage === totalPages &&
                    "pointer-events-none opacity-50",
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}
