"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminFilterBar } from "@/components/dashboard/admin-filter-bar";
import { AdminInboxStatusFilter } from "@/components/dashboard/admin-inbox-status-filter";
import {
  CONTACT_ENQUIRY_ADMIN_LABELS,
  CONTACT_ENQUIRY_TYPES,
} from "@/constants/contact-enquiry";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { ContactMessageListQuery } from "@/validations/contact-message";

export function ContactMessagesFilters({
  query,
}: {
  query: ContactMessageListQuery;
}) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.contactUs,
      search: query.search,
    });

  const hasFilters =
    query.search !== "" ||
    query.enquiryType !== "all" ||
    query.inboxStatus !== "inbox";

  return (
    <AdminFilterBar
      searchId="contact-messages-search"
      searchLabel="Search contact messages"
      searchPlaceholder="Filter by name, email, or subject…"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={ROUTES.contactUs}
      onClear={clearSearchLocal}
    >
      <AdminInboxStatusFilter
        id="contact-messages-inbox-status"
        value={query.inboxStatus}
        disabled={isPending}
        onChange={(value) =>
          navigate({ inboxStatus: value === "inbox" ? "" : value })
        }
      />
      <Label htmlFor="contact-messages-enquiry-type" className="sr-only">
        Enquiry route
      </Label>
      <Select
        value={query.enquiryType}
        onValueChange={(value) => {
          if (value) navigate({ enquiryType: value });
        }}
        disabled={isPending}
      >
        <SelectTrigger
          id="contact-messages-enquiry-type"
          className="min-h-11 w-full sm:min-h-8 sm:w-40"
        >
          <SelectValue placeholder="All routes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All routes</SelectItem>
          {CONTACT_ENQUIRY_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {CONTACT_ENQUIRY_ADMIN_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </AdminFilterBar>
  );
}
