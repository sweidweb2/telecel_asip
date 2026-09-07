import {
  adminListRange,
  adminListTotalPages,
  gateAdminPageData,
} from "@/lib/admin/admin-list-query";
import { applyInboxStatusFilter } from "@/lib/admin/apply-inbox-status-filter";
import { createClient } from "@/lib/supabase/server";
import {
  fetchInboxTableStats,
  type InboxTableStats,
} from "@/data/inbox-stats";
import type {
  ContactMessage,
  ContactMessageListResult,
} from "@/types/contact-message";
import type { ContactMessageListQuery } from "@/validations/contact-message";

const MESSAGE_COLUMNS =
  "id, enquiry_type, full_name, email, phone, subject, message, inbox_status, created_at" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchContactMessages(
  supabase: ServerClient,
  query: ContactMessageListQuery,
): Promise<ContactMessageListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("contact_messages")
    .select(MESSAGE_COLUMNS, { count: "estimated" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  request = applyInboxStatusFilter(request, query.inboxStatus);

  if (query.enquiryType !== "all") {
    request = request.eq("enquiry_type", query.enquiryType);
  }

  if (query.search) {
    request = request.or(
      `full_name.ilike.%${query.search}%,email.ilike.%${query.search}%,subject.ilike.%${query.search}%`,
    );
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    messages: (data ?? []) as ContactMessage[],
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

export async function getContactMessagesPageData(
  query: ContactMessageListQuery,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; list: ContactMessageListResult; stats: InboxTableStats }
> {
  return gateAdminPageData(
    async (supabase) => {
      const [list, stats] = await Promise.all([
        fetchContactMessages(supabase, query),
        fetchInboxTableStats(supabase, "contact_messages"),
      ]);
      return { list, stats };
    },
    { name: "getContactMessagesPageData" },
  );
}
