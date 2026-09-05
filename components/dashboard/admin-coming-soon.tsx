import type { LucideIcon } from "lucide-react";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { Card, CardContent } from "@/components/ui/card";

type AdminComingSoonProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

/**
 * Placeholder for CMS routes that are linked or reachable but not built yet.
 */
export function AdminComingSoon({
  title,
  description,
  icon: Icon,
}: AdminComingSoonProps) {
  return (
    <AdminListPageShell title={title} description={description}>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Icon className="size-6" />
          </span>
          <p className="font-heading text-lg font-semibold tracking-tight">
            Coming soon
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            This section is not available yet. Use the sidebar to open a finished
            CMS page.
          </p>
        </CardContent>
      </Card>
    </AdminListPageShell>
  );
}
