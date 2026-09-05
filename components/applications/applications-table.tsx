"use client";

import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import { FileTextIcon } from "lucide-react";

import { ApplicationRowActions } from "@/components/applications/application-row-actions";
import { ApplicationsFilters } from "@/components/applications/applications-filters";
import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import type { Application } from "@/types/application";
import {
  APPLICATION_PAGE_SIZE,
  type ApplicationListQuery,
} from "@/validations/application";

export function ApplicationsTable({
  applications,
  total,
  totalPages,
  query,
}: {
  applications: Application[];
  total: number;
  totalPages: number;
  query: ApplicationListQuery;
}) {
  const [clientSearch, setClientSearch] = useState(query.search);
  const [prevQuerySearch, setPrevQuerySearch] = useState(query.search);

  if (query.search !== prevQuerySearch) {
    setPrevQuerySearch(query.search);
    setClientSearch(query.search);
  }

  const onSearchChange = useCallback((value: string) => {
    setClientSearch(value);
  }, []);

  const visible = useMemo(() => {
    const term = clientSearch.trim().toLowerCase();
    if (!term || term === query.search.toLowerCase()) return applications;
    return applications.filter(
      (row) =>
        row.full_name.toLowerCase().includes(term) ||
        row.email.toLowerCase().includes(term) ||
        row.company_name.toLowerCase().includes(term),
    );
  }, [applications, clientSearch, query.search]);

  return (
    <AdminDataTable
      filters={
        <ApplicationsFilters query={query} onSearchChange={onSearchChange} />
      }
      header={
        <TableRow>
          <TableHead className="pl-4">Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Startup</TableHead>
          <TableHead>Sector</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="w-28 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={visible.length === 0}
      emptyColSpan={6}
      empty={
        <div className="mx-auto flex max-w-sm flex-col items-center gap-2 whitespace-normal">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted">
            <FileTextIcon className="size-5 text-muted-foreground" />
          </span>
          <p className="font-medium">No applications found</p>
          <p className="text-sm text-muted-foreground">
            Official Apply submissions will appear here. Leads stay under
            Registrations.
          </p>
        </div>
      }
      pagination={{
        basePath: ROUTES.applications,
        page: query.page,
        pageSize: APPLICATION_PAGE_SIZE,
        total,
        totalPages,
        filters: { search: query.search },
      }}
    >
      {visible.map((application) => (
        <TableRow key={application.id}>
          <TableCell className="max-w-[10rem] truncate pl-4 font-medium sm:max-w-[14rem]">
            {application.full_name}
          </TableCell>
          <TableCell className="max-w-[12rem] truncate text-muted-foreground">
            {application.email}
          </TableCell>
          <TableCell className="max-w-[10rem] truncate">
            {application.company_name}
          </TableCell>
          <TableCell className="whitespace-nowrap">
            {application.sector}
          </TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground">
            {format(new Date(application.created_at), "MMM d, yyyy")}
          </TableCell>
          <TableCell className="pr-4">
            <ApplicationRowActions application={application} />
          </TableCell>
        </TableRow>
      ))}
    </AdminDataTable>
  );
}
