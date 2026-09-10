"use client";

import type { ReactNode } from "react";

import {
  AdminPagination,
  type AdminPaginationProps,
} from "@/components/dashboard/admin-pagination";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type AdminDataTablePagination = AdminPaginationProps;

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
 * Shared CMS list table chrome: filters, scrollable table, empty state, pagination.
 * One scroll region (max-height) so thead can stick; no nested overflow wrappers.
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
        <div className="max-h-[min(70vh,calc(100dvh-14rem))] overflow-auto">
          <table
            data-slot="table"
            className={cn(
              "w-full caption-bottom text-sm",
              "[&_tbody>tr]:border-l-[3px] [&_tbody>tr]:border-l-transparent",
              "[&_tbody>tr]:transition-[border-color,background-color] motion-reduce:[&_tbody>tr]:transition-none",
              "[&_tbody>tr:hover]:border-l-brand",
            )}
          >
            <TableHeader className="sticky top-0 z-10 bg-card shadow-[inset_0_-1px_0_0_var(--border)] [&_th]:bg-card">
              {header}
            </TableHeader>
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
