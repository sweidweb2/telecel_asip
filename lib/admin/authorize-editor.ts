import { getAuthUser } from "@/lib/admin/get-auth-user";
import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { traceAsync } from "@/lib/admin/perf";
import { createClient } from "@/lib/supabase/server";

export type AuthorizeEditorMessages = {
  signedInRequired: string;
  unauthorized: string;
};

export type EditorSession =
  | {
      status: "success";
      userId: string;
      supabase: Awaited<ReturnType<typeof createClient>>;
    }
  | { status: "error"; message: string };

/**
 * Session + editor gate for CMS / settings / intake Server Actions.
 * Uses request-cached `getStaffShell` via `isCurrentUserEditor`.
 */
export async function authorizeEditor(
  messages: AuthorizeEditorMessages,
): Promise<EditorSession> {
  return traceAsync(
    "authorizeEditor",
    { eventType: "data_read", cacheStatus: "n_a" },
    async () => {
      const [user, isEditor] = await Promise.all([
        getAuthUser(),
        isCurrentUserEditor(),
      ]);

      if (!user) {
        return { status: "error", message: messages.signedInRequired };
      }

      if (!isEditor) {
        return { status: "error", message: messages.unauthorized };
      }

      const supabase = await createClient();
      return { status: "success", userId: user.id, supabase };
    },
  );
}
