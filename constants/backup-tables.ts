/** Public base tables included in full / automated / selectable table backups. */
export const BACKUP_TABLE_ALLOWLIST = [
  "profiles",
  "interest_registrations",
  "applications",
  "investor_interests",
  "investor_engagements",
  "contact_messages",
  "site_settings",
  "newsletter_subscribers",
  "blogs",
  "startups",
  "startup_details",
  "partners",
  "evidence_records",
  "impact_metrics",
  "founder_stories",
  "events",
  "event_startups",
  "cohorts",
  "cohort_partners",
  "cohort_startups",
] as const;

export type BackupTableName = (typeof BACKUP_TABLE_ALLOWLIST)[number];

export const BACKUP_STORAGE_BUCKETS = [
  "blogs",
  "auther",
  "startups",
  "partners",
] as const;

export type BackupStorageBucket = (typeof BACKUP_STORAGE_BUCKETS)[number];

const ALLOWLIST_SET = new Set<string>(BACKUP_TABLE_ALLOWLIST);

export function isBackupTableName(value: string): value is BackupTableName {
  return ALLOWLIST_SET.has(value);
}

export function resolveBackupTables(
  scope: "full" | "tables" | "automated",
  targetTables?: readonly string[] | null,
): BackupTableName[] {
  if (scope === "full" || scope === "automated") {
    return [...BACKUP_TABLE_ALLOWLIST];
  }
  const selected = (targetTables ?? []).filter(isBackupTableName);
  return [...new Set(selected)];
}
