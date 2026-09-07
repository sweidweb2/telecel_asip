"use client";

import { CircleAlertIcon, MapPinnedIcon } from "lucide-react";

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
                ? "Public pages — some surfaces are not reflected"
                : undefined
            }
          />
        }
      >
        <MapPinnedIcon className="size-4" />
        Public pages
        {hasUnreflected ? (
          <CircleAlertIcon
            className="size-4 text-amber-600 dark:text-amber-400"
            aria-hidden
          />
        ) : null}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{guide.title}</DialogTitle>
          <DialogDescription>{guide.intro}</DialogDescription>
        </DialogHeader>

        <ul className="grid gap-4">
          {guide.surfaces.map((surface) => (
            <li
              key={`${surface.page}-${surface.path}`}
              className="rounded-lg border bg-muted/20 p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {surface.page}
                  </p>
                  <p className="text-xs text-muted-foreground">{surface.path}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
                    surface.reflected
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-500/15 text-amber-800 dark:text-amber-400",
                  )}
                >
                  {surface.reflected ? "Reflected" : "Not reflected"}
                </span>
              </div>
              <dl className="mt-3 grid gap-2">
                <div className="grid gap-0.5">
                  <dt className="text-xs font-medium text-foreground">
                    What shows
                  </dt>
                  <dd className="text-sm text-muted-foreground">
                    {surface.shows}
                  </dd>
                </div>
                <div className="grid gap-0.5">
                  <dt className="text-xs font-medium text-foreground">Rule</dt>
                  <dd className="text-sm text-muted-foreground">
                    {surface.rule}
                  </dd>
                </div>
              </dl>
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
