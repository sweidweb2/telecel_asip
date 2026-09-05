import { cache } from "react";
import { unstable_cache } from "next/cache";

import {
  adminListRange,
  adminListTotalPages,
} from "@/lib/admin/admin-list-query";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import { wrapCached, traceAsync } from "@/lib/admin/perf";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type {
  FounderStory,
  FounderStoryDetail,
  FounderStoryListItem,
  FounderStoryListResult,
  FounderStoryPublic,
  StartupStoryOption,
} from "@/types/founder-story";
import {
  founderStoryIdSchema,
  type FounderStoryListQuery,
} from "@/validations/founder-story";

export const FOUNDER_STORIES_CACHE_TAG = "founder-stories";

/** Cap startup picker so editor pages stay bounded. */
const STORY_PICKER_LIMIT = 100;

const LIST_COLUMNS =
  "id, publish_status, quote_permission_status, updated_at, startups!inner(name)" as const;

const DETAIL_COLUMNS =
  "id, startup_id, the_problem, what_they_built, the_asip_connection, where_they_are_now, founder_quote_text, quote_attribution_name, quote_attribution_title, quote_date, quote_permission_status, publish_status, created_at, updated_at, startups!inner(name)" as const;

const PUBLIC_COLUMNS =
  "the_problem, what_they_built, the_asip_connection, where_they_are_now, founder_quote_text, quote_attribution_name, quote_attribution_title, quote_date, quote_permission_status" as const;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

type StoryListRow = {
  id: string;
  publish_status: FounderStory["publish_status"];
  quote_permission_status: FounderStory["quote_permission_status"];
  updated_at: string;
  startups: { name: string } | { name: string }[] | null;
};

type StoryRowWithStartup = FounderStory & {
  startups: { name: string } | { name: string }[] | null;
};

function startupNameFromJoin(
  startups: StoryListRow["startups"],
): string {
  if (!startups) return "";
  if (Array.isArray(startups)) return startups[0]?.name ?? "";
  return startups.name ?? "";
}

function toListItem(row: StoryListRow): FounderStoryListItem {
  return {
    id: row.id,
    publish_status: row.publish_status,
    quote_permission_status: row.quote_permission_status,
    updated_at: row.updated_at,
    startup_name: startupNameFromJoin(row.startups),
  };
}

function toDetail(row: StoryRowWithStartup): FounderStoryDetail {
  const { startups, ...story } = row;
  return {
    ...story,
    startup_name: startupNameFromJoin(startups),
  };
}

async function fetchFounderStoriesPage(
  supabase: ServerClient,
  query: FounderStoryListQuery,
): Promise<FounderStoryListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("founder_stories")
    .select(LIST_COLUMNS, { count: "estimated" })
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (query.status !== "all") {
    request = request.eq("publish_status", query.status);
  }

  if (query.search) {
    const pattern = escapeIlikePattern(query.search);
    request = request.ilike("startups.name", `%${pattern}%`);
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    stories: ((data ?? []) as unknown as StoryListRow[]).map(toListItem),
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

export async function getFounderStoriesPageData(
  query: FounderStoryListQuery,
): Promise<
  { status: "forbidden" } | { status: "ok"; list: FounderStoryListResult }
> {
  return traceAsync(
    "getFounderStoriesPageData",
    { eventType: "data_read", cacheStatus: "n_a" },
    async () => {
      const supabase = await createClient();

      const [isAdmin, list] = await Promise.all([
        isCurrentUserAdmin(),
        fetchFounderStoriesPage(supabase, query),
      ]);

      if (!isAdmin) return { status: "forbidden" };

      return { status: "ok", list };
    },
  );
}

type FounderStoryDetailResult =
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "ok"; story: FounderStoryDetail };

export const getFounderStoryByIdForAdmin = wrapCached(
  "getFounderStoryByIdForAdmin",
  { eventType: "data_read" },
  cache(
    async (id: string): Promise<FounderStoryDetailResult> => {
      if (!founderStoryIdSchema.safeParse(id).success) {
        return { status: "not_found" };
      }

      const supabase = await createClient();
      if (!(await isCurrentUserAdmin())) return { status: "forbidden" };

      const { data, error } = await supabase
        .from("founder_stories")
        .select(DETAIL_COLUMNS)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { status: "not_found" };

      return {
        status: "ok",
        story: toDetail(data as unknown as StoryRowWithStartup),
      };
    },
  ),
);

/**
 * Startups available for a new story picker. Excludes startups that already
 * have a story, unless `includeStartupId` is passed (edit mode).
 * Taken-id lookup is scoped to the candidate startup page (not unbounded).
 */
export async function getStartupsForStoryPicker(options?: {
  includeStartupId?: string;
  search?: string;
}): Promise<
  | { status: "forbidden" }
  | { status: "ok"; startups: StartupStoryOption[] }
> {
  return traceAsync(
    "getStartupsForStoryPicker",
    { eventType: "option_load", cacheStatus: "n_a" },
    async () => {
      const supabase = await createClient();
      if (!(await isCurrentUserAdmin())) return { status: "forbidden" };

      const includeId = options?.includeStartupId;
      const term = (options?.search ?? "").trim().slice(0, 100);

      let startupsQuery = supabase
        .from("startups")
        .select("id, name")
        .order("name", { ascending: true })
        .limit(STORY_PICKER_LIMIT);

      if (term) {
        const pattern = escapeIlikePattern(term);
        startupsQuery = startupsQuery.ilike("name", `%${pattern}%`);
      }

      const startupsResult = await startupsQuery;

      if (startupsResult.error) throw startupsResult.error;

      let candidates = (startupsResult.data ?? []) as StartupStoryOption[];

      if (includeId && !candidates.some((row) => row.id === includeId)) {
        const includedResult = await supabase
          .from("startups")
          .select("id, name")
          .eq("id", includeId)
          .maybeSingle();
        if (includedResult.error) throw includedResult.error;
        if (includedResult.data) {
          candidates = [
            includedResult.data as StartupStoryOption,
            ...candidates,
          ];
        }
      }

      const candidateIds = candidates.map((row) => row.id);
      if (candidateIds.length === 0) {
        return { status: "ok", startups: [] };
      }

      const takenResult = await supabase
        .from("founder_stories")
        .select("startup_id")
        .in("startup_id", candidateIds)
        .limit(STORY_PICKER_LIMIT);

      if (takenResult.error) throw takenResult.error;

      const taken = new Set(
        (takenResult.data ?? []).map((row) => row.startup_id as string),
      );

      const startups = candidates.filter((row) => {
        if (includeId && row.id === includeId) return true;
        return !taken.has(row.id);
      });

      return { status: "ok", startups };
    },
  );
}

type PublicStoryRow = {
  the_problem: string;
  what_they_built: string;
  the_asip_connection: string;
  where_they_are_now: string;
  founder_quote_text: string | null;
  quote_attribution_name: string | null;
  quote_attribution_title: string | null;
  quote_date: string | null;
  quote_permission_status: FounderStory["quote_permission_status"];
};

function toPublicStory(row: PublicStoryRow): FounderStoryPublic {
  const hasGrantedQuote =
    Boolean(row.founder_quote_text?.trim()) &&
    row.quote_permission_status === "granted" &&
    Boolean(row.quote_attribution_name?.trim());

  return {
    the_problem: row.the_problem,
    what_they_built: row.what_they_built,
    the_asip_connection: row.the_asip_connection,
    where_they_are_now: row.where_they_are_now,
    quote: hasGrantedQuote
      ? {
          text: row.founder_quote_text!.trim(),
          attribution_name: row.quote_attribution_name!.trim(),
          attribution_title: row.quote_attribution_title,
          date: row.quote_date,
        }
      : null,
  };
}

async function fetchPublishedFounderStoryByStartupId(
  startupId: string,
): Promise<FounderStoryPublic | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("founder_stories")
    .select(PUBLIC_COLUMNS)
    .eq("startup_id", startupId)
    .eq("publish_status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return toPublicStory(data as PublicStoryRow);
}

/** Cached published story for a founder profile page. */
export function getPublishedFounderStoryByStartupId(startupId: string) {
  return unstable_cache(
    () => fetchPublishedFounderStoryByStartupId(startupId),
    ["published-founder-story", startupId],
    { tags: [FOUNDER_STORIES_CACHE_TAG], revalidate: 300 },
  )();
}
