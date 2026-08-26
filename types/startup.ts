import type { Tables } from "@/types/database";

export type StartupStatus = "draft" | "active" | "inactive";

export type Startup = Tables<"startups">;
export type StartupDetails = Tables<"startup_details">;

export type StartupListItem = Pick<
  Startup,
  | "id"
  | "name"
  | "slug"
  | "logo_url"
  | "description"
  | "status"
  | "founded_at"
  | "created_at"
  | "updated_at"
>;

export type StartupWithDetails = Startup & {
  details: StartupDetails | null;
};

export type StartupPublicListItem = Pick<
  Startup,
  "id" | "name" | "slug" | "logo_url" | "description" | "founded_at"
>;

/** Public detail shows main `startups` fields only — not `startup_details`. */
export type StartupPublicDetail = StartupPublicListItem;

export type StartupSlugRow = Pick<Startup, "slug" | "updated_at">;

export type StartupListResult = {
  startups: StartupListItem[];
  total: number;
  totalPages: number;
};

export type StartupPublicPageResult = {
  items: StartupPublicListItem[];
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};
