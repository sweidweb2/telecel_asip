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
});

export type BackupListQuery = z.infer<typeof backupListQuerySchema>;

export function parseBackupListQuery(input: RawSearchParams): BackupListQuery {
  return backupListQuerySchema.parse(
    pickSearchParams(input, {
      page: "1",
      pageSize: String(BACKUP_DEFAULT_PAGE_SIZE),
    }),
  );
}

export function backupListFilterParams(
  query: BackupListQuery,
): Record<string, string | undefined> {
  return {
    pageSize:
      query.pageSize !== BACKUP_DEFAULT_PAGE_SIZE
        ? String(query.pageSize)
        : undefined,
  };
}

export const getBackupDownloadUrlSchema = z.object({
  backupId: z.uuid("Invalid backup id."),
});
