import type { Tables } from "@/types/database";

export type CmsPublishStatus = "draft" | "published";
export type QuotePermissionStatus = "granted" | "pending" | "denied";

export type FounderStory = Tables<"founder_stories">;

/** Lean list row — table columns only (no long narrative fields). */
export type FounderStoryListItem = Pick<
  FounderStory,
  "id" | "publish_status" | "quote_permission_status" | "updated_at"
> & {
  startup_name: string;
};

export type FounderStoryListResult = {
  stories: FounderStoryListItem[];
  total: number;
  totalPages: number;
};

export type FounderStoryDetail = FounderStory & {
  startup_name: string;
};

export type StartupStoryOption = {
  id: string;
  name: string;
};

/** Published founder narrative for marketing founder profiles. */
export type FounderStoryPublic = {
  the_problem: string;
  what_they_built: string;
  the_asip_connection: string;
  where_they_are_now: string;
  /** Only set when quote text exists and permission is granted. */
  quote: {
    text: string;
    attribution_name: string;
    attribution_title: string | null;
    date: string | null;
  } | null;
};

/**
 * Impact page case-study card. `pending` is a reserved seat — same shell,
 * no narrative, stats, or photos until the story is cleared.
 */
export type ImpactCaseStudyPublic = {
  id: string;
  startupId: string | null;
  title: string;
  name: string;
  slug: string;
  founderNames: string[];
  sector: string | null;
  country: string | null;
  coverImageUrl: string | null;
  imageFocalX: number;
  imageFocalY: number;
  barrier: string | null;
  support: string | null;
  outcome: string | null;
  /** Short public outcome — omit when empty or unverified. */
  stat: string | null;
  status: "live" | "pending";
};
