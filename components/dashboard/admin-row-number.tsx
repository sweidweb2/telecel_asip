"use client";

import { TableCell, TableHead } from "@/components/ui/table";
import { adminRowNumber } from "@/lib/admin-format";

/** Shared `#` column header for admin list tables. */
export function AdminRowNumberHead() {
  return (
    <TableHead className="w-12 pl-4 text-muted-foreground">#</TableHead>
  );
}

/** Absolute row number cell (respects pagination). */
export function AdminRowNumberCell({
  page,
  pageSize,
  index,
}: {
  page: number;
  pageSize: number;
  index: number;
}) {
  return (
    <TableCell className="pl-4 tabular-nums text-muted-foreground">
      {adminRowNumber(page, pageSize, index)}
    </TableCell>
  );
}
