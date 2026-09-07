import { revalidatePath, revalidateTag } from "next/cache";
import type { z } from "zod";

import {
  authorizeAdmin,
  type AdminSession,
  type AuthorizeAdminMessages,
} from "@/lib/admin/authorize-admin";
import { traceAsync } from "@/lib/admin/perf";
import {
  mapPgActionError,
  type PgActionError,
  type PgActionErrorContext,
  type PgActionErrorMessages,
} from "@/lib/admin/pg-action-error";
import type { AdminActionResult } from "@/types/admin-action";

export type { AdminActionResult } from "@/types/admin-action";

export type AdminMutationMessages = AuthorizeAdminMessages & {
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
 * Shared admin Server Action flow: Zod → authorizeAdmin → execute → map PG errors → refresh.
 */
export async function runAdminMutation<TSchema extends z.ZodTypeAny>({
  schema,
  input,
  messages,
  pgMessages,
  execute,
  refresh,
  perfName,
}: {
  schema: TSchema;
  input: unknown;
  messages: AdminMutationMessages;
  pgMessages?: PgActionErrorMessages;
  execute: (
    session: Extract<AdminSession, { status: "success" }>,
    data: z.infer<TSchema>,
  ) => Promise<AdminMutationExecuteResult>;
  refresh?: (data: z.infer<TSchema>, id?: string) => void;
  /** Optional stable name for admin_perf_events (defaults to runAdminMutation). */
  perfName?: string;
}): Promise<AdminActionResult> {
  return traceAsync(
    perfName ?? "runAdminMutation",
    { eventType: "mutation", cacheStatus: "n_a" },
    async () => {
      const parsed = schema.safeParse(input);
      if (!parsed.success) {
        return {
          status: "error",
          message: parsed.error.issues[0]?.message ?? messages.invalidDetails,
        };
      }

      const session = await authorizeAdmin(messages);
      if (session.status === "error") return session;

      const result = await execute(session, parsed.data);

      if (result.status === "error") {
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
    },
  );
}

/** Revalidate a list path and optional detail path / cache tags. */
export function refreshAdminResource({
  listPath,
  detailPath,
  cacheTags,
}: {
  listPath: string;
  detailPath?: string;
  cacheTags?: readonly string[];
}) {
  revalidatePath(listPath);
  if (detailPath) revalidatePath(detailPath);
  if (cacheTags) {
    for (const tag of cacheTags) {
      revalidateTag(tag, "max");
    }
  }
}
