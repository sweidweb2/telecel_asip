import type { Tables } from "@/types/database";

export type StartupStatus = "draft" | "active" | "inactive";

export type Startup = Tables<"startups">;
export type StartupDetails = Tables<"startup_details">;
export type StartupPublicRow = Tables<"startups_public">;

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
  StartupPublicRow,
  | "id"
  | "name"
  | "slug"
  | "logo_url"
  | "description"
  | "founded_at"
  | "cohort"
  | "country_code"
  | "sector"
  | "founder_names"
  | "cover_image_url"
  | "public_outcome"
  | "featured"
  | "image_focal_x"
  | "image_focal_y"
>;

/**
 * Public detail: core startup fields plus the approved subset of
 * `startup_details`. Funding figures and internal narrative fields
 * (problem, solution, target market, business model) stay admin-only.
 */
export type StartupPublicDetails = Pick<
  StartupPublicRow,
  | "website_url"
  | "industry"
  | "category"
  | "location"
  | "team"
  | "cohort"
  | "country_code"
  | "sector"
  | "founder_names"
  | "cover_image_url"
  | "public_outcome"
  | "image_focal_x"
  | "image_focal_y"
>;

export type StartupPublicDetail = StartupPublicListItem & {
  details: StartupPublicDetails | null;
};

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

export type StartupFilterOptions = {
  cohorts: string[];
  countries: string[];
  sectors: string[];
};
