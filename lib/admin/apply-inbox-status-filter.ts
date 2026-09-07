import type { InboxListFilter } from "@/validations/inbox";

type InboxFilterableQuery = {
  eq: (column: string, value: string) => InboxFilterableQuery;
  neq: (column: string, value: string) => InboxFilterableQuery;
};

/**
 * Apply admin inbox triage filter to a Supabase list query.
 * `inbox` = not archived; `any` = no status filter.
 */
export function applyInboxStatusFilter<T extends InboxFilterableQuery>(
  request: T,
  inboxStatus: InboxListFilter,
): T {
  if (inboxStatus === "any") return request;
  if (inboxStatus === "inbox") {
    return request.neq("inbox_status", "archived") as T;
  }
  return request.eq("inbox_status", inboxStatus) as T;
}
