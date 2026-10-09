"use client";

import { CircleAlertIcon, MapPinnedIcon } from "lucide-react";

import {
  ADMIN_INBOX_VIEW_DIALOG_CLASS,
  AdminDetailRow,
  AdminDetailSection,
} from "@/components/dashboard/admin-detail-row";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getAdminPublicReflection,
  hasUnreflectedAdminPublicSurfaces,
  type AdminPublicReflectionId,
} from "@/constants/admin-public-reflections";
import { cn } from "@/lib/utils";

type AdminPublicReflectionDialogProps = {
  resourceId: AdminPublicReflectionId;
  className?: string;
};

/**
 * Manage-page control: opens a guide of where CMS rows appear on public pages.
 */
export function AdminPublicReflectionDialog({
  resourceId,
  className,
}: AdminPublicReflectionDialogProps) {
  const guide = getAdminPublicReflection(resourceId);
  const hasUnreflected = hasUnreflectedAdminPublicSurfaces(resourceId);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn("min-h-11 w-full sm:w-auto", className)}
            aria-label={
              hasUnreflected
                ? "Public pages - some surfaces are not reflected"
                : undefined
            }
          />
        }
      >
        <MapPinnedIcon className="size-4" />
        Public pages
        {hasUnreflected ? (
          <CircleAlertIcon
            className="size-4 text-[var(--portal-accent)]"
            aria-hidden
          />
        ) : null}
      </DialogTrigger>
      <DialogContent className={ADMIN_INBOX_VIEW_DIALOG_CLASS}>
        <DialogHeader className="min-w-0 gap-3">
          <DialogTitle>{guide.title}</DialogTitle>
          <DialogDescription>{guide.intro}</DialogDescription>
        </DialogHeader>

        <ul className="grid gap-3">
          {guide.surfaces.map((surface) => (
            <li key={`${surface.page}-${surface.path}`}>
              <AdminDetailSection title={surface.page}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-xs text-muted-foreground">{surface.path}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
                      surface.reflected
                        ? "bg-primary text-primary-foreground"
                        : "border border-transparent bg-[var(--portal-accent)] text-white",
                    )}
                  >
                    {surface.reflected ? "Reflected" : "Not reflected"}
                  </span>
                </div>
                <AdminDetailRow label="What shows">{surface.shows}</AdminDetailRow>
                <AdminDetailRow label="Rule">{surface.rule}</AdminDetailRow>
              </AdminDetailSection>
            </li>
          ))}
        </ul>

        {guide.notes && guide.notes.length > 0 ? (
          <ul className="grid gap-1.5 border-t pt-3 text-sm text-muted-foreground">
            {guide.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
