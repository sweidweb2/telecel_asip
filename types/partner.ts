import type { Tables } from "@/types/database";

export type PartnerType =
  | "corporate"
  | "investors"
  | "technology"
  | "development"
  | "mentors"
  | "media";

export type Partner = Tables<"partners">;

export type PartnerListItem = Pick<
  Partner,
  | "id"
  | "name"
  | "org"
  | "type"
  | "contribution"
  | "is_active"
  | "logo_permission"
  | "logo_url"
  | "link"
  | "sort_order"
  | "created_at"
  | "updated_at"
>;

export type PartnerListResult = {
  partners: PartnerListItem[];
  total: number;
  totalPages: number;
};

/**
 * Public payload, read from the `partners_public` view. The view nulls
 * `logo_url` whenever `logo_permission` is false, so an unapproved logo URL is
 * unreachable even through a direct PostgREST call.
 */
export type PartnerPublicItem = {
  id: string;
  name: string;
  org: string | null;
  type: PartnerType;
  link: string | null;
  logo_url: string | null;
};

export type PartnerPublicGroups = {
  active: PartnerPublicItem[];
  historical: PartnerPublicItem[];
};
