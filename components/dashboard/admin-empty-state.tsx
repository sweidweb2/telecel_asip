import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminEmptyStateProps = {
  icon: LucideIcon;
  /**
   * When true, filters/search are active → no-results copy (no create CTA).
   * When false, the catalog is empty → empty copy + optional create.
   */
  isFiltered?: boolean;
  /** True-empty catalog title. */
  emptyTitle: string;
  /** True-empty catalog description. */
  emptyDescription: string;
  /** Filtered no-matches title. */
  noResultsTitle?: string;
  /** Filtered no-matches description. */
  noResultsDescription?: string;
  /** Link-based create CTA (full-page New routes). Shown only when not filtered. */
  createHref?: string;
  createLabel?: string;
  /** Custom action (e.g. create dialog). Overrides createHref when set. Shown only when not filtered. */
  action?: ReactNode;
};

/**
 * Shared CMS table empty state: distinguishes true empty vs filtered no-results.
 */
export function AdminEmptyState({
  icon: Icon,
  isFiltered = false,
  emptyTitle,
  emptyDescription,
  noResultsTitle = "No results found",
  noResultsDescription = "Try changing the filters or clearing search.",
  createHref,
  createLabel,
  action,
}: AdminEmptyStateProps) {
  const title = isFiltered ? noResultsTitle : emptyTitle;
  const description = isFiltered ? noResultsDescription : emptyDescription;

  const createAction =
    !isFiltered &&
    (action ??
      (createHref && createLabel ? (
        <Button
          className="mt-4 min-h-11"
          nativeButton={false}
          render={<Link href={createHref} />}
        >
          <PlusIcon className="size-4" />
          {createLabel}
        </Button>
      ) : null));

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 whitespace-normal">
      <span className="flex size-10 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </span>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
      {createAction || null}
    </div>
  );
}
