import { z } from "zod";

export const USER_ROLES = ["admin", "editor", "viewer"] as const;
export const USER_PAGE_SIZES = [10, 25, 50, 100] as const;

const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters")
  .max(80, "Full name must be 80 characters or fewer");

const emailSchema = z.email("Enter a valid email address").trim().toLowerCase();

const roleSchema = z.enum(USER_ROLES);

export const createUserSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number"),
  role: roleSchema,
});

export const updateUserSchema = z.object({
  id: z.uuid("Invalid user id"),
  fullName: fullNameSchema,
  email: emailSchema,
  role: roleSchema,
});

export const deleteUserSchema = z.object({
  id: z.uuid("Invalid user id"),
});

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  pageSize: z
    .enum(["10", "25", "50", "100"])
    .transform(Number)
    .pipe(
      z.union([z.literal(10), z.literal(25), z.literal(50), z.literal(100)]),
    )
    .catch(10),
  search: z
    .string()
    .trim()
    .max(100, "Search must be 100 characters or fewer")
    .regex(/^[^,%_()]*$/, "Search contains unsupported characters")
    .catch(""),
  role: z.enum(["all", ...USER_ROLES]).catch("all"),
});

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseUserListQuery(input: RawSearchParams): UserListQuery {
  return userListQuerySchema.parse({
    page: first(input.page) ?? "1",
    pageSize: first(input.pageSize) ?? "10",
    search: first(input.search) ?? "",
    role: first(input.role) ?? "all",
  });
}

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
