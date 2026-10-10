import { cache } from "react";
import { unstable_cache } from "next/cache";

import { fetchAdminListStats } from "@/data/admin-list-stats";
import { STARTUPS_CACHE_TAG } from "@/data/startups";
import {
  adminListRange,
  adminListTotalPages,
  gateEditorPageData,
} from "@/lib/admin/admin-list-query";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type {
  FounderStory,
  FounderStoryDetail,
  FounderStoryListItem,
  FounderStoryListResult,
  FounderStoryPublic,
  ImpactCaseStudyPublic,
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
  "id, startup_id, story_title, cover_image_url, headline_stat, the_problem, what_they_built, the_asip_connection, where_they_are_now, founder_quote_text, quote_attribution_name, quote_attribution_title, quote_date, quote_permission_status, publish_status, created_at, updated_at, startups!inner(name)" as const;

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

export type FounderStoryListStats = {
  total: number;
  published: number;
  draft: number;
  quotePending: number;
};

async function fetchFounderStoryListStats(
  supabase: ServerClient,
): Promise<FounderStoryListStats> {
  return fetchAdminListStats(supabase, "founder_stories", [
    "total",
    "published",
    "draft",
    "quotePending",
  ]);
}

export async function getFounderStoriesPageData(
  query: FounderStoryListQuery,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; list: FounderStoryListResult; stats: FounderStoryListStats }
> {
  return gateEditorPageData(
    async (supabase) => {
      const [list, stats] = await Promise.all([
        fetchFounderStoriesPage(supabase, query),
        fetchFounderStoryListStats(supabase),
      ]);
      return { list, stats };
    }
  );
}

type FounderStoryDetailResult =
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "ok"; story: FounderStoryDetail };

export const getFounderStoryByIdForAdmin = cache(
    async (id: string): Promise<FounderStoryDetailResult> => {
      if (!founderStoryIdSchema.safeParse(id).success) {
        return { status: "not_found" };
      }

      const gated = await gateEditorPageData(
        async (supabase) => {
          const { data, error } = await supabase
            .from("founder_stories")
            .select(DETAIL_COLUMNS)
            .eq("id", id)
            .maybeSingle();

          if (error) throw error;
          if (!data) return { story: null };

          return {
            story: toDetail(data as unknown as StoryRowWithStartup),
          };
        }
      );

      if (gated.status === "forbidden") return gated;
      if (!gated.story) return { status: "not_found" };
      return { status: "ok", story: gated.story };
    },
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
  return gateEditorPageData(
    async (supabase) => {
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
        return { startups: [] };
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

      return { startups };
    }
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

const IMPACT_CASE_STUDY_LIMIT = 9;
const IMPACT_CASE_STUDY_MIN_SLOTS = 3;

const CASE_STORY_COLUMNS =
  "id, startup_id, story_title, cover_image_url, headline_stat, the_problem, the_asip_connection, where_they_are_now" as const;

const CASE_STARTUP_COLUMNS =
  "id, name, slug, founder_names, sector, country_code, image_focal_x, image_focal_y" as const;

/** Bracketed CMS placeholders must not ship as live copy. */
const UNRESOLVED_PLACEHOLDER_RE = /\[[^\]\n]{1,80}\]/;

type CaseStoryRow = {
  id: string;
  startup_id: string;
  story_title: string | null;
  cover_image_url: string | null;
  headline_stat: string | null;
  the_problem: string;
  the_asip_connection: string;
  where_they_are_now: string;
};

type CaseStartupRow = {
  id: string | null;
  name: string | null;
  slug: string | null;
  founder_names: string[] | null;
  sector: string | null;
  country_code: string | null;
  image_focal_x: number | null;
  image_focal_y: number | null;
};

function publicLine(text: string | null | undefined, max = 140): string | null {
  const trimmed = text?.replace(/\s+/g, " ").trim() ?? "";
  if (!trimmed || UNRESOLVED_PLACEHOLDER_RE.test(trimmed)) return null;

  const sentence =
    trimmed.match(/^[^.!?]+[.!?]?(?=\s|$)/)?.[0]?.trim() ?? trimmed;
  if (sentence.length <= max) return sentence;
  return `${sentence.slice(0, max - 1).trimEnd()}…`;
}

function publicStat(text: string | null | undefined): string | null {
  const trimmed = text?.replace(/\s+/g, " ").trim() ?? "";
  if (!trimmed || UNRESOLVED_PLACEHOLDER_RE.test(trimmed)) return null;
  if (trimmed.length <= 48) return trimmed;
  return `${trimmed.slice(0, 47).trimEnd()}…`;
}

function identityFields(startup: CaseStartupRow) {
  return {
    startupId: startup.id,
    name: startup.name ?? "",
    slug: startup.slug ?? "",
    founderNames: startup.founder_names ?? [],
    sector: startup.sector?.trim() || null,
    country: startup.country_code?.trim() || null,
    imageFocalX: startup.image_focal_x ?? 50,
    imageFocalY: startup.image_focal_y ?? 50,
  };
}

function anonymousPendingSeat(index: number): ImpactCaseStudyPublic {
  return {
    id: `pending-slot-${index}`,
    startupId: null,
    title: "",
    name: "",
    slug: "",
    founderNames: [],
    sector: null,
    country: null,
    coverImageUrl: null,
    imageFocalX: 50,
    imageFocalY: 50,
    barrier: null,
    support: null,
    outcome: null,
    stat: null,
    status: "pending",
  };
}

function toCaseStudy(
  story: CaseStoryRow,
  startup: CaseStartupRow,
): ImpactCaseStudyPublic | null {
  if (!startup.id || !startup.name || !startup.slug) return null;

  const title = publicLine(story.story_title, 200);
  const barrier = publicLine(story.the_problem);
  const support = publicLine(story.the_asip_connection);
  const outcome = publicLine(story.where_they_are_now);
  // Incomplete published stories stay off Impact until narrative fields clear.
  if (!title || (!barrier && !support && !outcome)) return null;

  return {
    id: story.id,
    ...identityFields(startup),
    title,
    coverImageUrl: story.cover_image_url,
    barrier,
    support,
    outcome,
    stat: publicStat(story.headline_stat),
    status: "live",
  };
}

function padPendingSeats(
  live: ImpactCaseStudyPublic[],
): ImpactCaseStudyPublic[] {
  const slots = [...live];

  let index = 0;
  while (slots.length < IMPACT_CASE_STUDY_MIN_SLOTS) {
    slots.push(anonymousPendingSeat(index));
    index += 1;
  }

  return slots.slice(0, IMPACT_CASE_STUDY_LIMIT);
}

async function fetchPublishedImpactCaseStudies(): Promise<
  ImpactCaseStudyPublic[]
> {
  const supabase = createPublicClient();
  const [storiesResult, directoryResult] = await Promise.all([
    supabase
      .from("founder_stories")
      .select(CASE_STORY_COLUMNS)
      .eq("publish_status", "published")
      .order("updated_at", { ascending: false })
      .limit(IMPACT_CASE_STUDY_LIMIT),
    supabase
      .from("startups_public")
      .select(CASE_STARTUP_COLUMNS)
      .order("featured", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(IMPACT_CASE_STUDY_LIMIT),
  ]);

  if (storiesResult.error) throw storiesResult.error;
  if (directoryResult.error) throw directoryResult.error;

  const rows = (storiesResult.data ?? []) as CaseStoryRow[];
  const directory = (directoryResult.data ?? []) as CaseStartupRow[];
  const storyStartupIds = rows.map((row) => row.startup_id);
  const missingIds = storyStartupIds.filter(
    (id) => !directory.some((row) => row.id === id),
  );

  let storyStartups = directory.filter(
    (row) => row.id && storyStartupIds.includes(row.id),
  );

  if (missingIds.length > 0) {
    const extra = await supabase
      .from("startups_public")
      .select(CASE_STARTUP_COLUMNS)
      .in("id", missingIds);
    if (extra.error) throw extra.error;
    storyStartups = [...storyStartups, ...((extra.data ?? []) as CaseStartupRow[])];
  }

  const byId = new Map(
    storyStartups
      .filter((row): row is CaseStartupRow & { id: string } => Boolean(row.id))
      .map((row) => [row.id, row]),
  );

  const fromStories = rows.flatMap((story) => {
    const startup = byId.get(story.startup_id);
    if (!startup) return [];
    const item = toCaseStudy(story, startup);
    return item ? [item] : [];
  });

  return padPendingSeats(fromStories);
}

/** Published founder stories for the Impact case-study module. */
export const getPublishedImpactCaseStudies = unstable_cache(
  fetchPublishedImpactCaseStudies,
  ["published-impact-case-studies"],
  {
    tags: [FOUNDER_STORIES_CACHE_TAG, STARTUPS_CACHE_TAG],
    revalidate: 300,
  },
);
