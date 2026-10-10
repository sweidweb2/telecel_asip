"use client";

import type { ReactNode } from "react";

import { AdminFormSectionHelp } from "@/components/dashboard/admin-form-section-help";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AdminFormHelpSection } from "@/types/admin-form-help";

/**
 * Card wrapper for an admin form field group with a top-right help dialog.
 */
export function AdminFormSection({
  title,
  description,
  help,
  children,
  headerAction,
  className,
  contentClassName,
  headerClassName,
}: {
  title: string;
  description?: string;
  help: AdminFormHelpSection;
  children: ReactNode;
  /** Extra controls in the header action slot (e.g. upload buttons). */
  headerAction?: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
}) {
  return (
    <Card size="sm" className={cn("min-w-0", className)}>
      <CardHeader className={cn("border-b bg-brand-soft", headerClassName)}>
        <CardTitle>{title}</CardTitle>
        {description ? (
          <CardDescription>{description}</CardDescription>
        ) : null}
        <CardAction
          className={
            headerAction
              ? "flex flex-wrap items-center justify-end gap-2"
              : undefined
          }
        >
          <AdminFormSectionHelp help={help} />
          {headerAction}
        </CardAction>
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
