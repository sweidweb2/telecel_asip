import {
  adminListRange,
  adminListTotalPages,
  gateEditorPageData,
} from "@/lib/admin/admin-list-query";
import { applyInboxStatusFilter } from "@/lib/admin/apply-inbox-status-filter";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { createClient } from "@/lib/supabase/server";
import {
  fetchInboxTableStats,
  type InboxTableStats,
} from "@/data/inbox-stats";
import type {
  ContactMessage,
  ContactMessageListItem,
  ContactMessageListResult,
} from "@/types/contact-message";
import {
  deleteContactMessageSchema,
  type ContactMessageListQuery,
} from "@/validations/contact-message";

const MESSAGE_LIST_COLUMNS =
  "id, full_name, email, phone, inbox_status, created_at" as const;

const MESSAGE_DETAIL_COLUMNS =
  "id, enquiry_type, full_name, email, phone, subject, message, inbox_status, created_at" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchContactMessages(
  supabase: ServerClient,
  query: ContactMessageListQuery,
): Promise<ContactMessageListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("contact_messages")
    .select(MESSAGE_LIST_COLUMNS, { count: "estimated" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  request = applyInboxStatusFilter(request, query.inboxStatus);

  if (query.enquiryType !== "all") {
    request = request.eq("enquiry_type", query.enquiryType);
  }

  if (query.search) {
    const pattern = escapeIlikePattern(query.search);
    request = request.or(
      `full_name.ilike."%${pattern}%",email.ilike."%${pattern}%",subject.ilike."%${pattern}%"`,
    );
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    messages: (data ?? []) as ContactMessageListItem[],
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
  return gateEditorPageData(
    async (supabase) => {
      const [list, stats] = await Promise.all([
        fetchContactMessages(supabase, query),
        fetchInboxTableStats(supabase, "contact_messages"),
      ]);
      return { list, stats };
    }
  );
}

export async function getContactMessageById(
  id: string,
): Promise<
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "ok"; record: ContactMessage }
> {
  if (!deleteContactMessageSchema.safeParse({ id }).success) {
    return { status: "not_found" };
  }

  const gated = await gateEditorPageData(
    async (supabase) => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select(MESSAGE_DETAIL_COLUMNS)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return { record: (data as ContactMessage | null) ?? null };
    }
  );

  if (gated.status === "forbidden") return gated;
  if (!gated.record) return { status: "not_found" };
  return { status: "ok", record: gated.record };
}
