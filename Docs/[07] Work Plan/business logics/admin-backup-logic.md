## Admin backup module

Operational backups for ASIP CMS: on-demand exports from the admin Backup page, signed re-downloads, automated schedule driven by Settings (`backup_time`, Asia/Beirut), hourly Supabase cron tick, private Cloudflare R2 storage, and monthly retention. Not a substitute for Supabase PITR / dashboard restore.

---

### Routes & UI

| Surface | Path | Role |
| --- | --- | --- |
| Backup | `/dashboard/backup` | Create backup (Full DB / Storage), Run now, history, Recovery notes |
| Settings | `/dashboard/settings` | `backup_time` dropdown only (Off / weekly Sun / weekly Mon) |
| Cron API | `POST /api/cron/backup` | Hourly tick (Bearer `BACKUP_CRON_SECRET`) |
| Quick CSV API | `GET /api/admin/export/[table]` | Intake CSV on Applications / Registrations / Contact pages |

Nav: System → Backup / Settings. Entire dashboard is admin-only (`is_admin()`).

**Create backup UI**

- Scopes: Full DB · Storage (Supabase media buckets ZIP)
- Formats: DB scopes always JSON · Storage always ZIP
- **Run backup now** — automated full JSON one-shot (does not change schedule)
- Progress dialog with spinner while Create runs
- History: date, scope, size, status, actor; paginated; empty state; re-download via short-lived R2 signed URL

**Settings UI**

- Dropdown only (Zod + Postgres enum — no free text): Off, weekly Sun/Mon 03:00 Lebanon
- Default schedule: `weekly_sun_03`
- Changing schedule → save only (does not start a backup)
- Legacy `daily_*` values remain readable until the admin picks Off or weekly

---

### Data model

#### `public.backups`

Migration: `20260906210000_create_backups.sql` (+ `schedule_window` in `20260906220000_backup_schedule_settings.sql`).

| Column | Role |
| --- | --- |
| `id` | PK |
| `user_id` | Triggering admin; `null` for cron automated |
| `scope` | `full` \| `tables` \| `storage` \| `automated` (new creates: `full` / `storage` / `automated`; `tables` legacy) |
| `format` | `json` \| `csv` \| `sql` \| `zip` (new writes: `json` or `zip` only; `csv`/`sql` legacy) |
| `target_tables` | Legacy when `scope = tables` |
| `file_path` | Private R2 object key |
| `file_size` | Bytes |
| `status` | `pending` \| `processing` \| `completed` \| `failed` |
| `error_message` | Truncated failure text |
| `schedule_window` | Idempotency / retry key for automated windows |
| `created_at` | Insert time |

**RLS:** authenticated CRUD when `is_admin()`. Service role for cron. No anon. Files never public — signed GET only.

#### `site_settings.backup_time`

Enum `backup_schedule`: `off`, `daily_00` … `daily_18`, `weekly_sun_03`, `weekly_mon_03`.  
UI offers `off` / `weekly_sun_03` / `weekly_mon_03` (`constants/backup-schedule.ts`).  
Default `weekly_sun_03` (`20260906223000_backup_time_default_weekly.sql`).  
`now` is UI-only — never stored.

---

### Storage (Cloudflare R2)

Env (prefer `AWS_*`; `R2_*` aliases work):

| Var | Role |
| --- | --- |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | R2 API credentials |
| `AWS_BUCKET` | Bucket name (e.g. `telecel`) |
| `AWS_ENDPOINT` | S3 API origin (no bucket in path) |
| `AWS_DEFAULT_REGION` | Usually `auto` |
| `BACKUP_CRON_SECRET` | Protects `/api/cron/backup` |

Object keys: `backups/{scope}/{yyyy}/{mm}/{id}-{nanoid}.zip` inside the configured bucket. Endpoint path segments (if any) become an optional key prefix.

---

### Export engine (`lib/backups/`)

| Module | Role |
| --- | --- |
| `tables` allowlist | `constants/backup-tables.ts` — public base tables (no views) |
| `serialize.ts` | JSON table dumps + shared CSV helpers for Quick CSV |
| `table-export.ts` | Paginated full-table SELECT via admin client |
| `storage-export.ts` | List/download Supabase buckets `blogs`, `auther`, `startups`, `partners` into ZIP |
| `r2-config.ts` / `r2.ts` | Resolve env, upload, signed URL, delete |
| `run-backup.ts` | pending → processing → ZIP → R2 → completed / failed |
| `start-backup.ts` | Shared insert + run for manual and automated starts |
| `schedule.ts` | Asia/Beirut due windows + `scheduleWindowKey` |
| `retention-policy.ts` | Pure monthly retain picker (M-2 first/mid/last) |
| `automated.ts` | Overlap gate, one attempt per tick, window retries (max 3 across ticks), monthly retention |

**Overlap:** if any row is `pending`/`processing`, new starts (manual, run-now, cron) are skipped.

**Retries (scheduled windows):** one attempt per hourly tick; up to 3 failed attempts per `schedule_window`; stop on first `completed`; after 3 failures wait for next window.

---

### Automated schedule (tick + gate)

1. Supabase `pg_cron` hourly → `pg_net` POST `/api/cron/backup` with `Authorization: Bearer ${BACKUP_CRON_SECRET}`.
2. Route loads `backup_time` via **service role** (uncached — not marketing `unstable_cache`).
3. Skip if `off`, not due this Beirut hour, overlap, window already completed, or ≥3 failures.
4. Else run one attempt → retention.
5. Docs SQL: `Docs/[03] Database/supabase-functions.md` (job `asip-backup-tick`; unschedule old `asip-weekly-backup`).

**Schedule change (Settings):** persist new `backup_time` → `revalidateTag(site-settings)`. No automatic backup — use **Run backup now** on Backup when needed.

**Run now (Backup page):** if current schedule is due, uses the same window key so the hourly tick skips that window after success; otherwise `immediate:{iso}`.

---

### Retention (automated `completed` only)

Beirut calendar months:

- **M and M-1:** keep all
- **M-2:** keep ≤3 — nearest to month start, midpoint, end; delete the rest (R2 then DB)
- **Older than M-2:** delete all

---

### Security

- Admin-only UI / actions / history
- Cron secret required (401 if missing/wrong)
- R2 private; re-download checks admin + `completed` + `file_path` then signed URL (~15 min)
- Service role / R2 keys only in server modules (`actions/`, `app/api/`, `lib/backups/`)

---

### Tests (what exists)

| Area | Coverage |
| --- | --- |
| Serializers / Zod / schedule windows / monthly picker | Vitest |
| Cron route gate (401, off, not_due, due) | Vitest |
| Automated window skip/retry/success (one attempt per tick) | Vitest |
| Settings schema + form smoke | Vitest |
| E2E | Cron 401; backup Create/Run now/history; settings schedule UI; CSV on Applications + ACL |

No automated proof that remote `pg_cron` hits production R2 — verify with curl + history/R2, or wait for the Beirut window.

Manual dry-run:

```bash
curl -X POST http://localhost:3000/api/cron/backup \
  -H "Authorization: Bearer $BACKUP_CRON_SECRET"
```

---

### Key files

- UI: `app/(dashboard)/dashboard/backup/`, `components/dashboard/backup-*.tsx`, `components/settings/site-settings-form.tsx`
- Actions / data: `actions/backups.ts` (`createBackup`, `runBackupNow`, download), `actions/settings.ts`, `data/backups.ts`, `data/settings.ts`
- Constants: `constants/backup-schedule.ts`, `constants/backup-tables.ts`
- Validations: `validations/backup.ts`, `validations/settings.ts`
- API: `app/api/cron/backup/route.ts`, `app/api/admin/export/[table]/route.ts`
- Migrations: `20260906210000_create_backups.sql`, `20260906220000_backup_schedule_settings.sql`, `20260906223000_backup_time_default_weekly.sql`

---

### Locked feature list (backup module)

- On-demand Full DB / Storage ZIP exports (JSON for DB)
- Run backup now (automated full JSON) on Backup page
- Progress dialog with spinner on create
- Backup history table with status, size, actor, pagination, empty state
- Re-download via short-lived private R2 signed URLs
- Quick CSV exports on inbox list pages (Applications / Registrations / Contact)
- Recovery copy pointing at Supabase PITR (in-app ≠ restore)
- `backups` audit table + admin RLS + `schedule_window`
- Private R2 upload (`AWS_*` / `R2_*`), versioned keys under `backups/…`
- Settings `backup_time` dropdown (Off + weekly Lebanon) + default weekly Sunday 03:00
- Hourly Supabase cron tick + app-side due/overlap/retry gates
- One attempt per tick; up to 3 failed attempts per schedule window, then wait next window
- Monthly automated retention (keep M/M-1; compact M-2 to first/mid/last; drop older)
- Cron protected by `BACKUP_CRON_SECRET`
- Unit + route + E2E smoke tests for schedule gates and Backup/Settings UI
