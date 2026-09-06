import {
  adminListRange,
  adminListTotalPages,
  gateAdminPageData,
} from "@/lib/admin/admin-list-query";
import type { BackupListQuery } from "@/validations/backup";
import type { Database } from "@/types/database";

export type BackupListRow = {
  id: string;
  created_at: string;
  user_id: string | null;
  scope: Database["public"]["Enums"]["backup_scope"];
  format: Database["public"]["Enums"]["backup_format"];
  target_tables: string[] | null;
  file_path: string | null;
  file_size: number | null;
  status: Database["public"]["Enums"]["backup_status"];
  error_message: string | null;
  actor_name: string | null;
};

export type BackupsListResult = {
  backups: BackupListRow[];
  total: number;
  totalPages: number;
};

const LIST_COLUMNS =
  "id, created_at, user_id, scope, format, target_tables, file_path, file_size, status, error_message" as const;

export async function getBackupsPageData(
  query: BackupListQuery,
): Promise<
  { status: "forbidden" } | ({ status: "ok" } & BackupsListResult)
> {
  return gateAdminPageData(
    async (supabase) => {
      const { from, to } = adminListRange(query.page, query.pageSize);

      const { data, error, count } = await supabase
        .from("backups")
        .select(LIST_COLUMNS, { count: "exact" })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const rows = data ?? [];
      const userIds = [
        ...new Set(
          rows
            .map((row) => row.user_id)
            .filter((id): id is string => typeof id === "string"),
        ),
      ];

      const nameById = new Map<string, string | null>();
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);
        if (profilesError) throw profilesError;
        for (const profile of profiles ?? []) {
          nameById.set(profile.id, profile.full_name);
        }
      }

      const total = count ?? 0;
      return {
        backups: rows.map((row) => ({
          ...row,
          actor_name: row.user_id
            ? (nameById.get(row.user_id) ?? null)
            : null,
        })),
        total,
        totalPages: adminListTotalPages(total, query.pageSize),
      };
    },
    { name: "getBackupsPageData" },
  );
}
