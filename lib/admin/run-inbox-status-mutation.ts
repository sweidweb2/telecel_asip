import {
  runAdminMutation,
  type AdminMutationMessages
} from "@/lib/admin/run-admin-mutation";
import type { AdminActionResult } from "@/types/admin-action";
import {
  updateInboxStatusSchema,
  type UpdateInboxStatusInput,
} from "@/validations/inbox";

export type InboxStatusTable =
  | "applications"
  | "interest_registrations"
  | "investor_interests"
  | "investor_engagements"
  | "contact_messages";

/**
 * Shared inbox status update for applications / interest / contact.
 * Callers pass table, localized messages, and resource refresh.
 */
export async function runInboxStatusMutation(options: {
  table: InboxStatusTable;
  input: UpdateInboxStatusInput;
  messages: AdminMutationMessages;
  refresh: () => void;
  perfName?: string;
}): Promise<AdminActionResult> {
  const { table, input, messages, refresh, perfName } = options;

  return runAdminMutation({
    schema: updateInboxStatusSchema,
    input,
    messages,
    perfName: perfName ?? `updateInboxStatus:${table}`,
    execute: async (session, data) => {
      let query = session.supabase
        .from(table)
        .update({ inbox_status: data.inboxStatus })
        .eq("id", data.id);

      // Auto-mark unread→reviewed must not clobber archive/other transitions.
      if (data.onlyIfStatus) {
        query = query.eq("inbox_status", data.onlyIfStatus);
      }

      const { data: row, error } = await query.select("id").maybeSingle();

      if (error) {
        return {
          status: "error",
          message: messages.genericError ?? messages.invalidDetails,
        };
      }
      if (!row) {
        // Conditional mark: already transitioned — treat as idempotent success.
        if (data.onlyIfStatus) {
          return { status: "success" };
        }
        return {
          status: "error",
          message: messages.notFound ?? messages.invalidDetails,
        };
      }
      return { status: "success" };
    },
    refresh,
  });
}
