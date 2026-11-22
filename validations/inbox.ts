import { z } from "zod";

import { INBOX_STATUSES } from "@/constants/inbox";

export const updateInboxStatusSchema = z.object({
  id: z.uuid("Invalid id"),
  inboxStatus: z.enum(INBOX_STATUSES),
  /** When set, the UPDATE only applies if the row currently has this status. */
  onlyIfStatus: z.enum(INBOX_STATUSES).optional(),
});

export type UpdateInboxStatusInput = z.infer<typeof updateInboxStatusSchema>;

/**
 * Admin list filter. Default `inbox` = unread + reviewed (excludes archived).
 * `any` = every status (named so URL nav does not strip `all` as a default).
 */
export const INBOX_LIST_FILTERS = [
  "inbox",
  "unread",
  "reviewed",
  "archived",
  "any",
] as const;

export type InboxListFilter = (typeof INBOX_LIST_FILTERS)[number];

export const INBOX_LIST_FILTER_LABELS: Record<InboxListFilter, string> = {
  inbox: "Inbox",
  unread: "Unread",
  reviewed: "Reviewed",
  archived: "Archived",
  any: "All",
};

export const inboxListFilterSchema = z.enum(INBOX_LIST_FILTERS).catch("inbox");
