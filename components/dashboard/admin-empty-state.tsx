import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Link-based create CTA (full-page New routes). */
  createHref?: string;
  createLabel?: string;
  /** Custom action (e.g. create dialog). Overrides createHref when set. */
  action?: ReactNode;
};

/**
 * Shared CMS table empty state: icon, copy, optional Create CTA.
 */
export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  createHref,
  createLabel,
  action,
}: AdminEmptyStateProps) {
  const createAction =
    action ??
    (createHref && createLabel ? (
      <Button
        className="mt-4 min-h-11"
        nativeButton={false}
        render={<Link href={createHref} />}
      >
        <PlusIcon className="size-4" />
        {createLabel}
      </Button>
    ) : null);

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 whitespace-normal">
      <span className="flex size-10 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </span>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
      {createAction}
    </div>
  );
}
