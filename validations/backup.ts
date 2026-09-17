import { z } from "zod";

import {
  pickSearchParams,
  type RawSearchParams,
} from "@/validations/admin-list-query";

export const BACKUP_CREATE_SCOPES = ["full", "storage"] as const;
/** New backups: JSON for DB scopes, ZIP for storage. Legacy csv/sql/tables may still exist in history. */
export const BACKUP_CREATE_FORMATS = ["json", "zip"] as const;
export const BACKUP_PAGE_SIZES = [10, 25, 50] as const;
export const BACKUP_PAGE_SIZE_VALUES = ["10", "25", "50"] as const;
export const BACKUP_DEFAULT_PAGE_SIZE = 25;

export const BACKUP_LIST_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
] as const;

export const BACKUP_LIST_SCOPES = [
  "full",
  "storage",
  "automated",
  "tables",
] as const;

export const BACKUP_LIST_SORTS = [
  "created_at",
  "status",
  "scope",
  "file_size",
] as const;

export type BackupListSort = (typeof BACKUP_LIST_SORTS)[number];

export const createBackupSchema = z
  .object({
    scope: z.enum(BACKUP_CREATE_SCOPES),
    format: z.enum(BACKUP_CREATE_FORMATS),
  })
  .superRefine((value, ctx) => {
    if (value.scope === "storage") {
      if (value.format !== "zip") {
        ctx.addIssue({
          code: "custom",
          path: ["format"],
          message: "Storage backups must use ZIP format.",
        });
      }
      return;
    }

    if (value.format !== "json") {
      ctx.addIssue({
        code: "custom",
        path: ["format"],
        message: "Database backups use JSON format.",
      });
    }
  });

export type CreateBackupInput = z.infer<typeof createBackupSchema>;

const backupListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  pageSize: z
    .enum(BACKUP_PAGE_SIZE_VALUES)
    .catch("25")
    .transform(
      (value) => Number(value) as (typeof BACKUP_PAGE_SIZES)[number],
    ),
  status: z.enum(["all", ...BACKUP_LIST_STATUSES]).catch("all"),
  scope: z.enum(["all", ...BACKUP_LIST_SCOPES]).catch("all"),
  sort: z.enum(BACKUP_LIST_SORTS).catch("created_at"),
  dir: z.enum(["asc", "desc"]).catch("desc"),
});

export type BackupListQuery = z.infer<typeof backupListQuerySchema>;

export function parseBackupListQuery(input: RawSearchParams): BackupListQuery {
  return backupListQuerySchema.parse(
    pickSearchParams(input, {
      page: "1",
      pageSize: String(BACKUP_DEFAULT_PAGE_SIZE),
      status: "all",
      scope: "all",
      sort: "created_at",
      dir: "desc",
    }),
  );
}

export function backupListFilterParams(
  query: BackupListQuery,
): Record<string, string | undefined> {
  const isDefaultSort =
    query.sort === "created_at" && query.dir === "desc";

  return {
    status: query.status === "all" ? undefined : query.status,
    scope: query.scope === "all" ? undefined : query.scope,
    sort: isDefaultSort ? undefined : query.sort,
    dir: isDefaultSort ? undefined : query.dir,
    pageSize:
      query.pageSize !== BACKUP_DEFAULT_PAGE_SIZE
        ? String(query.pageSize)
        : undefined,
  };
}

export const getBackupDownloadUrlSchema = z.object({
  backupId: z.uuid("Invalid backup id."),
});
