import type { Tables } from "@/types/database";

export type ContactMessage = Tables<"contact_messages">;

/** Columns shown on the inbox table (no message body). */
export type ContactMessageListItem = Pick<
  ContactMessage,
  | "id"
  | "full_name"
  | "email"
  | "phone"
  | "inbox_status"
  | "created_at"
>;

export type ContactMessageListResult = {
  messages: ContactMessageListItem[];
  total: number;
  totalPages: number;
};
