"use server";

import { revalidatePath } from "next/cache";
import { match, P } from "ts-pattern";

import { ROUTES } from "@/constants/routes";
import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createUserSchema,
  deleteUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type DeleteUserInput,
  type UpdateUserInput,
} from "@/validations/users";

export type UserActionResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const AUTH_MESSAGES = {
  signedInRequired: "You must be signed in.",
  unauthorized: "You do not have permission to manage users.",
} as const;

function validationMessage(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Check the submitted user details.";
}

function mapSupabaseError(message: string): string {
  const lower = message.toLowerCase();

  return match(lower)
    .with(
      P.when(
        (value) =>
          value.includes("already registered") ||
          value.includes("already been registered") ||
          value.includes("duplicate"),
      ),
      () => "A user with this email already exists.",
    )
    .with(
      P.when((value) => value.includes("password")),
      () => "The password does not meet the project requirements.",
    )
    .otherwise(() => message || "The user operation failed.");
}

function refreshUsersRoute() {
  revalidatePath(ROUTES.users);
}

export async function createUser(
  input: CreateUserInput,
): Promise<UserActionResult> {
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: validationMessage(parsed.error) };
  }

  const session = await authorizeAdmin(AUTH_MESSAGES);
  if (session.status === "error") return session;

  const admin = createAdminClient();
  const { data: created, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.fullName },
    app_metadata: { app_role: parsed.data.role },
  });

  if (error) {
    return { status: "error", message: mapSupabaseError(error.message) };
  }

  // GoTrue can fire on_auth_user_created before app_metadata is visible to
  // handle_new_user, so the profile may land as viewer. Set the intended role
  // through the admin session (protect trigger requires is_admin()).
  if (created.user) {
    const { error: profileError } = await session.supabase
      .from("profiles")
      .update({ role: parsed.data.role })
      .eq("id", created.user.id);

    if (profileError) {
      return {
        status: "error",
        message: mapSupabaseError(profileError.message),
      };
    }
  }

  refreshUsersRoute();
  return { status: "success", message: "User created successfully." };
}

export async function updateUser(
  input: UpdateUserInput,
): Promise<UserActionResult> {
  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: validationMessage(parsed.error) };
  }

  const session = await authorizeAdmin(AUTH_MESSAGES);
  if (session.status === "error") return session;

  if (session.userId === parsed.data.id && parsed.data.role !== "admin") {
    return {
      status: "error",
      message: "You cannot remove your own administrator access.",
    };
  }

  // Email and full name are written once, to Auth. The on_auth_user_updated
  // trigger mirrors them into profiles in the same transaction, so the login
  // identity and the CMS row cannot drift apart.
  const admin = createAdminClient();
  const { error: authError } = await admin.auth.admin.updateUserById(
    parsed.data.id,
    {
      email: parsed.data.email,
      user_metadata: { full_name: parsed.data.fullName },
      app_metadata: { app_role: parsed.data.role },
    },
  );

  if (authError) {
    return {
      status: "error",
      message: mapSupabaseError(authError.message),
    };
  }

  // Role lives only in profiles, and the protect-role trigger requires an admin
  // session, so it stays on the session client.
  const { error: profileError } = await session.supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.id);

  if (profileError) {
    return {
      status: "error",
      message: mapSupabaseError(profileError.message),
    };
  }

  refreshUsersRoute();
  return { status: "success", message: "User updated successfully." };
}

export async function deleteUser(
  input: DeleteUserInput,
): Promise<UserActionResult> {
  const parsed = deleteUserSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: validationMessage(parsed.error) };
  }

  const session = await authorizeAdmin(AUTH_MESSAGES);
  if (session.status === "error") return session;

  if (session.userId === parsed.data.id) {
    return { status: "error", message: "You cannot delete your own account." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(parsed.data.id);

  if (error) {
    return { status: "error", message: mapSupabaseError(error.message) };
  }

  refreshUsersRoute();
  return { status: "success", message: "User deleted successfully." };
}
