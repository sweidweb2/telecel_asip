export const INBOX_STATUSES = ["unread", "reviewed", "archived"] as const;

export type InboxStatus = (typeof INBOX_STATUSES)[number];

export const INBOX_STATUS_LABELS: Record<InboxStatus, string> = {
  unread: "Unread",
  reviewed: "Reviewed",
  archived: "Archived",
};
