import type { ReactNode } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { Button } from "@/components/ui/button";
import {
  getAdminResource,
  type AdminResourceId,
} from "@/constants/admin-resources";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type ListOk<TList extends { totalPages: number }> = {
  status: "ok";
  list: TList;
};

/**
 * Shared CMS list route: parse the query, clamp an over-page URL, then render
 * the list shell. Tables and stat cards stay with the resource.
 */
export async function CmsListPage<
  TQuery extends { page: number },
  TList extends { totalPages: number },
  TResult extends ListOk<TList>,
>({
  resourceId,
  searchParams,
  parseQuery,
  fetchPage,
  activeFilters,
  newItem,
  actions,
  stats,
  children,
}: {
  resourceId: AdminResourceId;
  searchParams: SearchParams;
  parseQuery: (
    input: Record<string, string | string[] | undefined>,
  ) => TQuery;
  fetchPage: (query: TQuery) => Promise<{ status: "forbidden" } | TResult>;
  activeFilters: (query: TQuery) => Record<string, string | undefined>;
  newItem?: { href: string; label: string };
  actions?: ReactNode;
  stats?: (result: TResult) => ReactNode;
  children: (args: { query: TQuery; result: TResult }) => ReactNode;
}) {
  const resource = getAdminResource(resourceId);
  const query = parseQuery(await searchParams);
  const result = await loadAdminListPage({
    query,
    fetchPage,
    listPath: resource.listPath,
    buildClampParams: (current, totalPages) =>
      adminListClampParams(totalPages, activeFilters(current)),
  });

  const hasActions = Boolean(newItem || actions);

  return (
    <AdminListPageShell
      title={resource.pageTitle}
      actions={
        hasActions ? (
          <>
            {newItem ? (
              <Button
                className="min-h-11 w-full sm:w-auto"
                nativeButton={false}
                render={<Link href={newItem.href} />}
              >
                <PlusIcon className="size-4" />
                {newItem.label}
              </Button>
            ) : null}
            {actions}
          </>
        ) : undefined
      }
    >
      {stats ? stats(result) : null}
      {children({ query, result })}
    </AdminListPageShell>
  );
}
