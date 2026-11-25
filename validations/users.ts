import { z } from "zod";

import {
  parseAdminListQuery,
  type RawSearchParams,
} from "@/validations/admin-list-query";
import {
  PASSWORD_MAX,
  PASSWORD_MIN,
  passwordComplexitySchema,
} from "@/validations/common-fields";

export const USER_ROLES = ["admin", "editor", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Audience types staff may assign to non-admin accounts. */
export const STAFF_AUDIENCE_TYPES = ["startup", "investor"] as const;
export type StaffAudienceType = (typeof STAFF_AUDIENCE_TYPES)[number];

/** Fixed page size — not configurable via URL or UI. */
export const USER_PAGE_SIZE = 10;

/** Roles an admin may assign on create/update. */
export const ADMIN_ASSIGNABLE_ROLES = ["admin", "editor", "viewer"] as const;

/** Roles an editor may assign on create/update (never admin). */
export const EDITOR_ASSIGNABLE_ROLES = ["editor", "viewer"] as const;

export const USER_FULL_NAME_MIN = 2;
export const USER_FULL_NAME_MAX = 80;
export const USER_EMAIL_MAX = 254;
export const USER_PASSWORD_MIN = PASSWORD_MIN;
export const USER_PASSWORD_MAX = PASSWORD_MAX;

const fullNameSchema = z
  .string()
  .trim()
  .min(USER_FULL_NAME_MIN, "Full name must be at least 2 characters")
  .max(USER_FULL_NAME_MAX, "Full name must be 80 characters or fewer");

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(USER_EMAIL_MAX, "Email must be 254 characters or fewer")
  .email("Enter a valid email address")
  .transform((value) => value.toLowerCase());

const passwordSchema = passwordComplexitySchema({
  min: "Password must be at least 8 characters",
  max: "Password must be 128 characters or fewer",
  letter: "Password must include a letter",
  number: "Password must include a number",
});

const userRoleSchema = z.enum(USER_ROLES);
const staffAudienceTypeSchema = z.enum(STAFF_AUDIENCE_TYPES);

export const createUserSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema,
  /** Ignored when role is admin (forced to admin type in the action). */
  type: staffAudienceTypeSchema.default("startup"),
});

export const updateUserSchema = z.object({
  id: z.uuid("Invalid user id"),
  fullName: fullNameSchema,
  email: emailSchema,
  role: userRoleSchema,
  /** Ignored when role is admin (forced to admin type in the action). */
  type: staffAudienceTypeSchema,
});

export const deleteUserSchema = z.object({
  id: z.uuid("Invalid user id"),
});

export const hardDeleteUserSchema = z.object({
  id: z.uuid("Invalid user id"),
});

export const USER_LIST_SORTS = [
  "full_name",
  "email",
  "role",
  "created_at",
  "updated_at",
] as const;

export type UserListSort = (typeof USER_LIST_SORTS)[number];

const userListQueryInputSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  search: z
    .string()
    .trim()
    .max(100, "Search must be 100 characters or fewer")
    .regex(/^[^,%_()]*$/, "Search contains unsupported characters")
    .catch(""),
  role: z.enum(["all", ...USER_ROLES]).catch("all"),
  sort: z.enum(USER_LIST_SORTS).catch("created_at"),
  dir: z.enum(["asc", "desc"]).catch("desc"),
});

export type UserListQuery = z.infer<typeof userListQueryInputSchema> & {
  pageSize: typeof USER_PAGE_SIZE;
};

export function parseUserListQuery(input: RawSearchParams): UserListQuery {
  return parseAdminListQuery({
    input,
    schema: userListQueryInputSchema,
    pageSize: USER_PAGE_SIZE,
    defaults: {
      page: "1",
      search: "",
      role: "all",
      sort: "created_at",
      dir: "desc",
    },
  });
}

/** Input type — `type` stays optional; Zod applies the `startup` default on parse. */
export type CreateUserInput = z.input<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type HardDeleteUserInput = z.infer<typeof hardDeleteUserSchema>;

export function assignableRolesForActor(
  actorRole: "admin" | "editor",
): readonly UserRole[] {
  return actorRole === "admin"
    ? ADMIN_ASSIGNABLE_ROLES
    : EDITOR_ASSIGNABLE_ROLES;
}

export function defaultRoleForActor(actorRole: "admin" | "editor"): UserRole {
  return actorRole === "admin" ? "admin" : "editor";
}
