import type { Tables } from "@/types/database";

export type EventFormat = "virtual" | "in_person" | "hybrid";

export type CmsPublishStatus = "draft" | "published";

export type Event = Tables<"events">;

export type EventListItem = Pick<
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
  /** Loaded with the admin list so row edit does not wipe links. */
  startup_ids: string[];
};

export type EventDetail = EventListItem;

export type EventListResult = {
  events: EventListItem[];
  total: number;
  totalPages: number;
};

/** Narrow option for the admin startup multi-select. */
export type EventStartupOption = {
  id: string;
  name: string;
};
