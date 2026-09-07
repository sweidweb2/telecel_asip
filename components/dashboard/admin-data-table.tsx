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
 * Column cells and filter controls stay entity-specific.
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
        <div className="overflow-x-auto">
          <Table>
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
          </Table>
        </div>
      </CardContent>

      <CardFooter className="w-full border-t bg-transparent px-4 py-3">
        <AdminPagination {...pagination} />
      </CardFooter>
    </Card>
  );
}
