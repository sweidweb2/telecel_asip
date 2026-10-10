"use client";

import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { AdminActionTooltip } from "@/components/dashboard/admin-action-tooltip";
import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import { Button } from "@/components/ui/button";

type AdminRowEditLinkProps = {
  href: string;
  /** Accessible name, including the record, for example "Edit North Cohort". */
  label: string;
};

/** Pencil control that opens a record editor. Hover shows "Edit" only. */
export function AdminRowEditLink({ href, label }: AdminRowEditLinkProps) {
  return (
    <AdminActionTooltip label="Edit">
      <Button
        variant="ghost"
        size="icon"
        className={ADMIN_ICON_BUTTON_CLASS}
        aria-label={label}
        nativeButton={false}
        render={<Link href={href} />}
      >
        <PencilIcon />
      </Button>
    </AdminActionTooltip>
  );
}
