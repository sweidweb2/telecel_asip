"use client";

import type { ReactNode } from "react";

import {
  AdminPagination,
  type AdminPaginationProps,
} from "@/components/dashboard/admin-pagination";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type AdminDataTablePagination = AdminPaginationProps;

/**
 * Column-header tint. Do not add `hover:bg-*` here: it conflicts with
 * `TableRow`'s `hover:bg-muted/50` inside `twMerge`, and the two bundles
 * disagree, which hydrates a different `className`.
 */
export const CMS_HEAD_ROW_CLASS = "bg-brand-soft";

type AdminDataTableProps = {
  filters?: ReactNode;
  /** Column header row(s) inside `TableHeader`. */
  header: ReactNode;
  /** Body rows when the list is non-empty. */
  children: ReactNode;
  isEmpty: boolean;
  emptyColSpan: number;
  empty: ReactNode;
  pagination: AdminDataTablePagination;
};

/**
 * Shared CMS list table chrome: filters, table, empty state, pagination.
 * Row count is capped by pagination, so the table is as tall as its rows.
 * The page scrolls. Wide tables can still scroll sideways on small screens.
 */
export function AdminDataTable({
  filters,
  header,
  children,
  isEmpty,
  emptyColSpan,
  empty,
  pagination,
}: AdminDataTableProps) {
  return (
    <Card className="min-w-0 gap-0 overflow-hidden py-0">
      {filters}

      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <table
            data-slot="table"
            className={cn(
              "w-full caption-bottom text-sm",
              "[&_tbody>tr]:border-l-[3px] [&_tbody>tr]:border-l-transparent",
              "[&_tbody>tr]:transition-[border-color,background-color] motion-reduce:[&_tbody>tr]:transition-none",
              "[&_tbody>tr:hover]:border-l-brand",
            )}
          >
            <TableHeader>{header}</TableHeader>
            <TableBody>
              {isEmpty ? (
                <TableRow>
                  <TableCell colSpan={emptyColSpan} className="h-48 text-center">
                    {empty}
                  </TableCell>
                </TableRow>
              ) : (
                children
              )}
            </TableBody>
          </table>
        </div>
      </CardContent>

      <CardFooter className="w-full border-t bg-transparent px-4 py-3">
        <AdminPagination {...pagination} />
      </CardFooter>
    </Card>
  );
}
