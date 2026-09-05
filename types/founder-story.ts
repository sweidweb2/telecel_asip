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
