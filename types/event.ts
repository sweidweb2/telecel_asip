import type { Tables } from "@/types/database";

export type EventFormat = "virtual" | "in_person" | "hybrid";

export type CmsPublishStatus = "draft" | "published";

export type Event = Tables<"events">;

/** Lean list row — table columns only. */
export type EventListItem = Pick<
  Event,
  | "id"
  | "name"
  | "event_date"
  | "location"
  | "format"
  | "publish_status"
  | "created_at"
  | "updated_at"
>;

/** Narrow option for the admin startup multi-select. */
export type EventStartupOption = {
  id: string;
  name: string;
};

/** Detail / edit payload including heavy fields and startup links. */
export type EventDetail = Pick<
  Event,
  | "id"
  | "name"
  | "event_date"
  | "location"
  | "format"
  | "speakers"
  | "assets"
  | "outcomes"
  | "publish_status"
  | "created_at"
  | "updated_at"
> & {
  startup_ids: string[];
  /** Names for linked startups (detail display only). */
  linked_startups: EventStartupOption[];
};

export type EventListResult = {
  events: EventListItem[];
  total: number;
  totalPages: number;
};
