"use client";

import { MailsIcon } from "lucide-react";

import {
  AdminDataTable,
  CMS_HEAD_ROW_CLASS,
} from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import {
  AdminRowNumberCell,
  AdminRowNumberHead,
} from "@/components/dashboard/admin-row-number";
import { NewsletterSubscribersFilters } from "@/components/newsletter/newsletter-subscribers-filters";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { formatAdminDate } from "@/lib/admin-format";
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
import type { NewsletterSubscriber } from "@/types/newsletter-subscriber";
import {
  NEWSLETTER_PAGE_SIZE,
  type NewsletterListQuery,
} from "@/validations/newsletter";

export function NewsletterSubscribersTable({
  subscribers,
  total,
  totalPages,
  query,
}: {
  subscribers: NewsletterSubscriber[];
  total: number;
  totalPages: number;
  query: NewsletterListQuery;
}) {
  const listFilters = {
    search: query.search,
  };
  const isFiltered = adminListFiltersActive(listFilters);

  return (
    <AdminDataTable
      filters={<NewsletterSubscribersFilters query={query} />}
      header={
        <TableRow className={CMS_HEAD_ROW_CLASS}>
          <AdminRowNumberHead />
          <TableHead>Email</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Consent</TableHead>
          <TableHead>Subscribed</TableHead>
        </TableRow>
      }
      isEmpty={subscribers.length === 0}
      emptyColSpan={5}
      empty={
        <AdminEmptyState
          icon={MailsIcon}
          isFiltered={isFiltered}
          emptyTitle="No subscribers yet"
          emptyDescription="Wait for opt-ins once public newsletter signup is enabled."
          noResultsTitle="No subscribers found"
          noResultsDescription="Try changing the filters or clearing search."
        />
      }
      pagination={{
        basePath: ROUTES.newsletter,
        page: query.page,
        pageSize: NEWSLETTER_PAGE_SIZE,
        total,
        totalPages,
        filters: listFilters,
      }}
    >
      {subscribers.map((subscriber, index) => (
        <TableRow key={subscriber.id}>
          <AdminRowNumberCell
            page={query.page}
            pageSize={NEWSLETTER_PAGE_SIZE}
            index={index}
          />
          <TableCell className="max-w-[14rem] truncate font-medium sm:max-w-[20rem]">
            {subscriber.email}
          </TableCell>
          <TableCell className="max-w-[10rem] truncate text-muted-foreground sm:max-w-[14rem]">
            {subscriber.source_page ?? "—"}
          </TableCell>
          <TableCell>{subscriber.consent ? "Yes" : "No"}</TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground">
            {formatAdminDate(subscriber.created_at)}
          </TableCell>
        </TableRow>
      ))}
    </AdminDataTable>
  );
}
