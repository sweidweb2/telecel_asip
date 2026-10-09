import {
  adminListRange,
  adminListTotalPages,
  gateEditorPageData,
} from "@/lib/admin/admin-list-query";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { createClient } from "@/lib/supabase/server";
import type {
  NewsletterSubscriber,
  NewsletterSubscriberListResult,
} from "@/types/newsletter-subscriber";
import type { NewsletterListQuery } from "@/validations/newsletter";

const SUBSCRIBER_COLUMNS =
  "id, email, consent, source_page, created_at" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchNewsletterSubscribers(
  supabase: ServerClient,
  query: NewsletterListQuery,
): Promise<NewsletterSubscriberListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("newsletter_subscribers")
    .select(SUBSCRIBER_COLUMNS, { count: "estimated" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (query.search) {
    const pattern = escapeIlikePattern(query.search);
    request = request.or(
      `email.ilike."%${pattern}%",source_page.ilike."%${pattern}%"`,
    );
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    subscribers: (data ?? []) as NewsletterSubscriber[],
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

export async function getNewsletterSubscribersPageData(
  query: NewsletterListQuery,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; list: NewsletterSubscriberListResult }
> {
  return gateEditorPageData(
    async (supabase) => {
      const list = await fetchNewsletterSubscribers(supabase, query);
      return { list };
    },
    { name: "getNewsletterSubscribersPageData" },
  );
}
