"use server";

import { revalidatePath } from "next/cache";
import { match, P } from "ts-pattern";

import { ROUTES } from "@/constants/routes";
import { revalidateDashboardNavCounts } from "@/lib/admin/run-admin-mutation";
import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import { authorizeStaff } from "@/lib/admin/authorize-staff";
import { getStaffShell } from "@/lib/admin/get-staff-shell";
import {
  consumeStaffMutationRateLimit,
} from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";
import {
  assignableRolesForActor,
  createUserSchema,
  deleteUserSchema,
  hardDeleteUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type DeleteUserInput,
  type HardDeleteUserInput,
  type UpdateUserInput,
  type UserRole,
} from "@/validations/users";

export type UserActionResult =
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      code?: "HAS_RELATED" | "LAST_ADMIN" | "LAST_EDITOR";
    };

type ProfileRole = Database["public"]["Enums"]["user_role"];

const AUTH_MESSAGES = {
  signedInRequired: "You must be signed in.",
  unauthorized: "You do not have permission to manage users.",
  rateLimited: "Too many user changes. Try again later.",
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
    .with(
      P.when((value) => value.includes("last administrator")),
      () => "You cannot demote or delete the last administrator.",
    )
    .with(
      P.when((value) => value.includes("last editor")),
      () => "You cannot demote or delete the last editor.",
    )
    .with(
      P.when(
        (value) =>
          value.includes("linked to impact metrics") ||
          value.includes("impact metrics"),
      ),
      () =>
        "This user owns evidence linked to impact metrics. Unlink or delete those metrics first, then hard-delete again.",
    )
    .with(
      P.when(
        (value) =>
          value.includes("foreign key") ||
          value.includes("violates foreign key") ||
          value.includes("restrict"),
      ),
      () =>
        "This user still owns connected records that cannot be removed automatically. Resolve linked rows first, then retry.",
    )
    .otherwise(() => message || "The user operation failed.");
}

function refreshUsersRoute() {
  revalidatePath(ROUTES.users);
  revalidatePath(ROUTES.adminUsers);
  revalidateDashboardNavCounts();
}

async function actorStaffRole(): Promise<"admin" | "editor" | null> {
  const shell = await getStaffShell();
  if (shell.isAdmin) return "admin";
  if (shell.isEditor) return "editor";
  return null;
}

function isAssignable(
  actor: "admin" | "editor",
  role: UserRole,
): boolean {
  return (assignableRolesForActor(actor) as readonly string[]).includes(role);
}

async function countRole(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  role: ProfileRole,
): Promise<number | null> {
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", role);
  if (error) {
    console.error("[users] countRole failed", { role, message: error.message });
    return null;
  }
  return count ?? 0;
}

async function getProfileRole(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  id: string,
): Promise<ProfileRole | null | undefined> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[users] getProfileRole failed", {
      id,
      message: error.message,
    });
    return undefined;
  }
  return data?.role ?? null;
}

async function countEvidenceOwned(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  ownerId: string,
): Promise<number | null> {
  const { count, error } = await supabase
    .from("evidence_records")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId);
  if (error) {
    console.error("[users] countEvidenceOwned failed", {
      ownerId,
      message: error.message,
    });
    return null;
  }
  return count ?? 0;
}

export async function createUser(
  input: CreateUserInput,
): Promise<UserActionResult> {
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: validationMessage(parsed.error) };
  }

  const session = await authorizeStaff(AUTH_MESSAGES);
  if (session.status === "error") return session;

  const actor = await actorStaffRole();
  if (!actor) {
    return { status: "error", message: AUTH_MESSAGES.unauthorized };
  }

  if (!isAssignable(actor, parsed.data.role)) {
    return {
      status: "error",
      message:
        actor === "editor"
          ? "Editors can only create editor or viewer accounts."
          : "That role is not allowed.",
    };
  }

  const admin = createAdminClient();
  if (
    !(await consumeStaffMutationRateLimit(
      admin,
      session.userId,
      "userCreate",
    ))
  ) {
    return { status: "error", message: AUTH_MESSAGES.rateLimited };
  }

  const profileType =
    parsed.data.role === "admin" ? "admin" : parsed.data.type;

  const { data: created, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
      ...(parsed.data.role === "admin"
        ? {}
        : { account_type: parsed.data.type }),
    },
    app_metadata: { app_role: parsed.data.role },
  });

  if (error) {
    return { status: "error", message: mapSupabaseError(error.message) };
  }

  if (!created.user) {
    return {
      status: "error",
      message: "The user operation failed.",
    };
  }

  const { data: profileRow, error: profileError } = await session.supabase
    .from("profiles")
    .update({
      role: parsed.data.role,
      type: profileType,
      full_name: parsed.data.fullName,
      email: parsed.data.email,
    })
    .eq("id", created.user.id)
    .select("id")
    .maybeSingle();

  if (profileError || !profileRow) {
    const { error: rollbackError } = await admin.auth.admin.deleteUser(
      created.user.id,
    );
    if (rollbackError) {
      console.error(
        "Failed to roll back Auth user after profile sync failure",
        {
          userId: created.user.id,
          profileError: profileError?.message ?? "profile row missing",
          rollbackError: rollbackError.message,
        },
      );
      return {
        status: "error",
        message:
          "User was created in Auth but profile sync failed, and Auth rollback also failed. Contact support before retrying.",
      };
    }
    return {
      status: "error",
      message: profileError
        ? mapSupabaseError(profileError.message)
        : "Profile sync failed after Auth create. The Auth user was rolled back.",
    };
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

  const session = await authorizeStaff(AUTH_MESSAGES);
  if (session.status === "error") return session;

  const actor = await actorStaffRole();
  if (!actor) {
    return { status: "error", message: AUTH_MESSAGES.unauthorized };
  }

  if (!isAssignable(actor, parsed.data.role)) {
    return {
      status: "error",
      message:
        actor === "editor"
          ? "Editors can only assign editor or viewer roles."
          : "That role is not allowed.",
    };
  }

  const targetRole = await getProfileRole(session.supabase, parsed.data.id);
  if (targetRole === undefined) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }
  if (targetRole === null) {
    return { status: "error", message: "User not found." };
  }

  if (actor === "editor" && targetRole === "admin") {
    return {
      status: "error",
      message: "Editors cannot change administrator accounts.",
    };
  }

  if (
    session.userId === parsed.data.id &&
    targetRole === "admin" &&
    parsed.data.role !== "admin"
  ) {
    return {
      status: "error",
      message: "You cannot remove your own administrator access.",
    };
  }

  if (targetRole === "admin" && parsed.data.role !== "admin") {
    const admins = await countRole(session.supabase, "admin");
    if (admins === null) {
      return {
        status: "error",
        message: "Something went wrong. Please try again.",
      };
    }
    if (admins <= 1) {
      return {
        status: "error",
        code: "LAST_ADMIN",
        message: "You cannot demote the last administrator.",
      };
    }
  }

  if (targetRole === "editor" && parsed.data.role !== "editor") {
    const editors = await countRole(session.supabase, "editor");
    if (editors === null) {
      return {
        status: "error",
        message: "Something went wrong. Please try again.",
      };
    }
    if (editors <= 1) {
      return {
        status: "error",
        code: "LAST_EDITOR",
        message: "You cannot demote the last editor.",
      };
    }
  }

  const { data: snapshot, error: snapshotError } = await session.supabase
    .from("profiles")
    .select("email, full_name, role")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (snapshotError || !snapshot) {
    return { status: "error", message: "User not found." };
  }

  const emailChanged =
    parsed.data.email.trim().toLowerCase() !==
    snapshot.email.trim().toLowerCase();

  // Editors must not change Auth emails (peer takeover via password reset).
  if (emailChanged && actor !== "admin") {
    return {
      status: "error",
      message: "Only administrators can change account emails.",
    };
  }

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

  const profileUpdate: Database["public"]["Tables"]["profiles"]["Update"] = {
    role: parsed.data.role,
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    // Admin role always forces type=admin; otherwise use staff-chosen audience.
    type: parsed.data.role === "admin" ? "admin" : parsed.data.type,
  };

  const { data: profileRow, error: profileError } = await session.supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (profileError || !profileRow) {
    const { error: revertError } = await admin.auth.admin.updateUserById(
      parsed.data.id,
      {
        email: snapshot.email,
        user_metadata: { full_name: snapshot.full_name },
        app_metadata: { app_role: snapshot.role },
      },
    );
    if (revertError) {
      console.error(
        "Failed to revert Auth user after profile update failure",
        {
          userId: parsed.data.id,
          profileError: profileError?.message ?? "profile row missing",
          revertError: revertError.message,
        },
      );
      return {
        status: "error",
        message:
          "Profile update failed and Auth could not be reverted. Auth and profile may disagree — contact support.",
      };
    }
    return {
      status: "error",
      message: profileError
        ? mapSupabaseError(profileError.message)
        : "User not found.",
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

  const session = await authorizeStaff(AUTH_MESSAGES);
  if (session.status === "error") return session;

  const actor = await actorStaffRole();
  if (!actor) {
    return { status: "error", message: AUTH_MESSAGES.unauthorized };
  }

  if (session.userId === parsed.data.id) {
    return { status: "error", message: "You cannot delete your own account." };
  }

  const targetRole = await getProfileRole(session.supabase, parsed.data.id);
  if (targetRole === undefined) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }
  if (targetRole === null) {
    return { status: "error", message: "User not found." };
  }

  if (actor === "editor" && targetRole !== "viewer") {
    return {
      status: "error",
      message: "Editors can only delete viewer accounts.",
    };
  }

  if (targetRole === "admin") {
    const admins = await countRole(session.supabase, "admin");
    if (admins === null) {
      return {
        status: "error",
        message: "Something went wrong. Please try again.",
      };
    }
    if (admins <= 1) {
      return {
        status: "error",
        code: "LAST_ADMIN",
        message: "You cannot delete the last administrator.",
      };
    }
  }

  if (targetRole === "editor") {
    const editors = await countRole(session.supabase, "editor");
    if (editors === null) {
      return {
        status: "error",
        message: "Something went wrong. Please try again.",
      };
    }
    if (editors <= 1) {
      return {
        status: "error",
        code: "LAST_EDITOR",
        message: "You cannot delete the last editor.",
      };
    }
  }

  const evidenceCount = await countEvidenceOwned(
    session.supabase,
    parsed.data.id,
  );
  if (evidenceCount === null) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }
  if (evidenceCount > 0) {
    return {
      status: "error",
      code: "HAS_RELATED",
      message:
        actor === "admin"
          ? `This user owns ${evidenceCount} evidence record(s). Use “Delete user and connected evidence” to remove them.`
          : `This user owns ${evidenceCount} evidence record(s). Ask an administrator to hard-delete the account.`,
    };
  }

  const admin = createAdminClient();
  if (
    !(await consumeStaffMutationRateLimit(
      admin,
      session.userId,
      "userDelete",
    ))
  ) {
    return { status: "error", message: AUTH_MESSAGES.rateLimited };
  }

  const { error } = await admin.auth.admin.deleteUser(parsed.data.id);

  if (error) {
    return { status: "error", message: mapSupabaseError(error.message) };
  }

  refreshUsersRoute();
  return { status: "success", message: "User deleted successfully." };
}

/**
 * Admin-only cascade delete: clears evidence ownership then removes the auth user.
 * Allowed even for the last editor when entities exist.
 */
export async function hardDeleteUser(
  input: HardDeleteUserInput,
): Promise<UserActionResult> {
  const parsed = hardDeleteUserSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: validationMessage(parsed.error) };
  }

  const session = await authorizeAdmin(AUTH_MESSAGES);
  if (session.status === "error") return session;

  if (session.userId === parsed.data.id) {
    return {
      status: "error",
      message: "You cannot hard-delete your own account.",
    };
  }

  const admin = createAdminClient();
  if (
    !(await consumeStaffMutationRateLimit(
      admin,
      session.userId,
      "userHardDelete",
    ))
  ) {
    return { status: "error", message: AUTH_MESSAGES.rateLimited };
  }

  const { error } = await session.supabase.rpc("admin_hard_delete_user", {
    p_target: parsed.data.id,
  });

  if (error) {
    return { status: "error", message: mapSupabaseError(error.message) };
  }

  refreshUsersRoute();
  return {
    status: "success",
    message: "User and connected evidence deleted successfully.",
  };
}
