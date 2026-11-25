import { revalidatePath, revalidateTag } from "next/cache";
import type { z } from "zod";

import { DASHBOARD_NAV_COUNTS_CACHE_TAG } from "@/constants/dashboard-nav-counts";
import {
  authorizeEditor,
  type AuthorizeRoleMessages,
  type StaffActionSession,
} from "@/lib/admin/authorize-role";
import { logServerActionError } from "@/lib/admin/log-server-action-error";
import {
  mapPgActionError,
  type PgActionError,
  type PgActionErrorContext,
  type PgActionErrorMessages,
} from "@/lib/admin/pg-action-error";
import type { AdminActionResult } from "@/types/admin-action";

export type AdminMutationMessages = AuthorizeRoleMessages & {
  invalidDetails: string;
  success: string;
  notFound?: string;
  genericError?: string;
};

type ExecuteSuccess = {
  status: "success";
  id?: string;
};

type ExecuteError = {
  status: "error";
  message?: string;
  pgError?: PgActionError;
  pgContext?: PgActionErrorContext;
};

export type AdminMutationExecuteResult = ExecuteSuccess | ExecuteError;

/**
 * Shared CMS Server Action flow: Zod → authorizeEditor → execute → map PG errors → refresh.
 */
export async function runAdminMutation<TSchema extends z.ZodTypeAny>({
  schema,
  input,
  messages,
  pgMessages,
  execute,
  refresh,
}: {
  schema: TSchema;
  input: unknown;
  messages: AdminMutationMessages;
  pgMessages?: PgActionErrorMessages;
  execute: (
    session: Extract<StaffActionSession, { status: "success" }>,
    data: z.infer<TSchema>,
  ) => Promise<AdminMutationExecuteResult>;
  refresh?: (data: z.infer<TSchema>, id?: string) => void;
}): Promise<AdminActionResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? messages.invalidDetails,
    };
  }

  const session = await authorizeEditor(messages);
  if (session.status === "error") return session;

  const result = await execute(session, parsed.data);

  if (result.status === "error") {
    if (result.pgError) {
      logServerActionError("[admin-mutation]", result.pgError, {
        context: result.pgContext ?? "write",
        mapped: Boolean(result.message),
      });
    }

    if (result.message) {
      return { status: "error", message: result.message };
    }
    if (result.pgError && pgMessages) {
      return {
        status: "error",
        message: mapPgActionError(
          result.pgError,
          pgMessages,
          result.pgContext ?? "write",
        ),
      };
    }
    return {
      status: "error",
      message: messages.genericError ?? messages.invalidDetails,
    };
  }

  refresh?.(parsed.data, result.id);
  return {
    status: "success",
    message: messages.success,
    id: result.id,
  };
}

/** Bust Editor sidebar badge totals after a counted table changes. */
export function revalidateDashboardNavCounts() {
  revalidateTag(DASHBOARD_NAV_COUNTS_CACHE_TAG, "max");
}

/** Revalidate a list path and optional detail path / cache tags. */
export function refreshAdminResource({
  listPath,
  detailPath,
  cacheTags,
  /**
   * Public intake should leave this false so open apply / register-interest /
   * contact traffic does not cold-start the shared nav-count RPC on every
   * submit. List-stats tags still bust via `cacheTags`. Badges catch up on the
   * 60s TTL (or the next CMS write).
   */
  bustNavCounts = true,
}: {
  /** Omit when the staff list route does not exist yet (cache tags only). */
  listPath?: string;
  detailPath?: string;
  cacheTags?: readonly string[];
  bustNavCounts?: boolean;
}) {
  if (listPath) revalidatePath(listPath);
  if (detailPath) revalidatePath(detailPath);
  if (bustNavCounts) {
    revalidateDashboardNavCounts();
  }
  if (cacheTags) {
    for (const tag of cacheTags) {
      revalidateTag(tag, "max");
    }
  }
}
