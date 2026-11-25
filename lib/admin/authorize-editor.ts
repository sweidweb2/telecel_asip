import {
  authorizeRole,
  type AuthorizeRoleMessages,
  type StaffActionSession,
} from "@/lib/admin/authorize-role";

export type AuthorizeEditorMessages = AuthorizeRoleMessages;
export type EditorSession = StaffActionSession;

/** Session + editor gate for CMS / settings / intake Server Actions. */
export async function authorizeEditor(
  messages: AuthorizeEditorMessages,
): Promise<EditorSession> {
  return authorizeRole("editor", messages);
}
