import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlertIcon } from "lucide-react";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { AdminPublicReflectionPanel } from "@/components/dashboard/admin-public-reflection-panel";
import { buttonVariants } from "@/components/ui/button";
import { ADMIN_RESOURCES } from "@/constants/admin-resources";
import {
  hasUnreflectedAdminPublicSurfaces,
  listAdminPublicReflectionIds,
  parseAdminCatalogResource,
} from "@/constants/admin-public-reflections";
import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/data/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Catalog | ASIP Admin",
};

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCatalogPage({
  searchParams,
}: CatalogPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const resourceId = parseAdminCatalogResource(params.resource);

  return (
    <AdminListPageShell title="Catalog">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
        <nav
          aria-label="CMS pages"
          className="grid content-start gap-1 lg:sticky lg:top-20"
        >
          {listAdminPublicReflectionIds().map((id) => {
            const selected = id === resourceId;
            const hasUnreflected = hasUnreflectedAdminPublicSurfaces(id);
            const title = ADMIN_RESOURCES[id].navTitle;

            return (
              <Link
                key={id}
                href={`${ROUTES.adminCatalog}?resource=${id}`}
                aria-current={selected ? "page" : undefined}
                aria-label={
                  hasUnreflected
                    ? `${title}, some public surfaces are not reflected`
                    : undefined
                }
                className={cn(
                  buttonVariants({ variant: selected ? "default" : "ghost" }),
                  "h-auto min-h-11 w-full justify-between px-3 whitespace-normal",
                )}
              >
                <span className="min-w-0 truncate text-left">{title}</span>
                {hasUnreflected ? (
                  <CircleAlertIcon
                    className={cn(
                      "size-4 shrink-0",
                      selected
                        ? "text-primary-foreground"
                        : "text-destructive",
                    )}
                    aria-hidden
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <AdminPublicReflectionPanel resourceId={resourceId} />
      </div>
    </AdminListPageShell>
  );
}
