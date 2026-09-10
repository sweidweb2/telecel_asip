import {
  runAdminMutation,
  type AdminActionResult,
  type AdminMutationMessages,
} from "@/lib/admin/run-admin-mutation";
import {
  updateInboxStatusSchema,
  type UpdateInboxStatusInput,
} from "@/validations/inbox";

export type InboxStatusTable =
  | "applications"
  | "interest_registrations"
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
      const { data: row, error } = await session.supabase
        .from(table)
        .update({ inbox_status: data.inboxStatus })
        .eq("id", data.id)
        .select("id")
        .maybeSingle();

      if (error) {
        return {
          status: "error",
          message: messages.genericError ?? messages.invalidDetails,
        };
      }
      if (!row) {
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
