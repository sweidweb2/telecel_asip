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

export type StartupPublicListItem = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string;
  founded_at: string | null;
  cohort: string | null;
  country_code: string | null;
  sector: string | null;
  founder_names: string[];
  cover_image_url: string | null;
  public_outcome: string | null;
  featured: boolean;
  image_focal_x: number;
  image_focal_y: number;
};

/**
 * Public detail: core startup fields plus the approved subset of
 * `startup_details`. Funding figures and internal narrative fields
 * (problem, solution, target market, business model) stay admin-only.
 */
export type StartupPublicDetails = {
  website_url: string | null;
  industry: string | null;
  category: string | null;
  location: string | null;
  team: string | null;
  cohort: string | null;
  country_code: string | null;
  sector: string | null;
  founder_names: string[];
  cover_image_url: string | null;
  public_outcome: string | null;
  image_focal_x: number;
  image_focal_y: number;
};

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

/** Aggregated public portfolio counts by ISO country code. */
export type StartupCountryReach = {
  countryCode: string;
  founderCount: number;
};
