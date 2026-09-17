# Supabase functions, RPCs & triggers

Derived from `supabase/migrations/`. Schema tables live in `Docs/[03] Database/schema.dbml`.

---

## Functions / RPCs

### `public.is_admin()`

| | |
| --- | --- |
| **Role** | RLS / authorization helper |
| **Returns** | `boolean` |
| **Security** | `SECURITY DEFINER`, `STABLE`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Checks whether the current session user (`auth.uid()`) has a `profiles` row with `role = 'admin'`.

**How it works:** Runs a single `EXISTS` query on `public.profiles`. Used by backups and `admin_perf_events` RLS, `admin_hard_delete_user`, and admin-only product surfaces. Definer + fixed `search_path` avoids search-path hijacking while still reading profiles under elevated rights for the check.

---

### `public.is_editor()`

| | |
| --- | --- |
| **Role** | RLS / authorization helper (CMS panel) |
| **Returns** | `boolean` |
| **Security** | `SECURITY DEFINER`, `STABLE`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** True when `profiles.role = 'editor'` for `auth.uid()`. Admins are intentionally excluded (admin panel has no CMS).

**How it works:** Same `EXISTS` pattern as `is_admin()`. Gates CMS/intake/settings/media RLS and CMS write RPCs / `get_admin_analytics` after `20260910180000`.

---

### `public.is_staff()`

| | |
| --- | --- |
| **Role** | RLS / authorization helper (shared staff) |
| **Returns** | `boolean` |
| **Security** | `SECURITY DEFINER`, `STABLE`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** True when `profiles.role` is `admin` or `editor`.

**How it works:** Used for shared staff gates that both shells need (e.g. `get_user_stats` auth check, site settings). Profiles list/update policies no longer use raw `is_staff()` alone — after `20260910220000` they use `is_admin()` for full access and `is_editor() AND role <> 'admin'` so editors cannot see or mutate administrator rows.

---

### `public.consume_rate_limit(p_key, p_limit, p_window_ms)`

| | |
| --- | --- |
| **Role** | Shared sliding-window rate limit (multi-instance) |
| **Returns** | `boolean` — `true` when the attempt is allowed (and recorded) |
| **Security** | `SECURITY DEFINER`, `search_path = public` |
| **Granted to** | `service_role` only |

**Details:** Atomically prunes hits older than `p_window_ms`, then records the current epoch-ms hit when under `p_limit`. Backed by `public.rate_limit_buckets` (service-role only; no anon/authenticated grants).

**How it works:** Upserts the bucket row, locks it (`FOR UPDATE`), filters hits, and either rejects or appends. App actions call this via `createAdminClient` + `consumeSharedRateLimit` (falls back to in-memory if the RPC is missing). Migration `20260910210000_intake_user_id_and_rate_limit.sql`.

---

### `public.get_user_stats()`

| | |
| --- | --- |
| **Role** | RPC (Users page stats — Admin + Editor) |
| **Returns** | One row: `total`, `admins`, `editors`, `viewers`, `new_this_week`, `new_this_month` (all `bigint`) |
| **Security** | `SECURITY INVOKER`, `STABLE`, `search_path = public`, staff-only |
| **Granted to** | `authenticated` (raises `42501` unless `is_staff()`) |

**Details:** Replaces multiple head-count queries with one round-trip for dashboard stats.

**How it works:** Raises `42501` unless `is_staff()` (`20260910180000`; previously `is_admin()` from `20260828191100`). Then a single `SELECT` over `public.profiles` with `COUNT(*)` and filtered counts by role and by `created_at` vs UTC week/month truncations. Invoker, so RLS still applies on top of the guard — editors (`20260910220000`) only count non-admin profiles (`admins` is therefore `0` in the editor shell).

---

### `public.get_staff_shell()`

| | |
| --- | --- |
| **Role** | RPC (staff dashboard layout chrome) |
| **Returns** | One row: `role` (`user_role`), `is_admin`, `is_editor` (booleans), `full_name`, `email` (text) |
| **Security** | `SECURITY INVOKER`, `STABLE`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Preferred one-shot shell for Editor/Admin layout routing after the staff split.

**How it works:** Selects role flags via `is_admin()` / `is_editor()` plus a `LEFT JOIN` on `profiles` for `auth.uid()`. Always returns a row; missing session/profile yields null role/name/email and false flags. Added `20260910180000`.

---

### `public.get_admin_shell()`

| | |
| --- | --- |
| **Role** | RPC (dashboard layout chrome — expanded compat) |
| **Returns** | One row: `is_admin`, `is_editor` (booleans), `role` (`user_role`), `full_name`, `email` (text) |
| **Security** | `SECURITY INVOKER`, `STABLE`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Compat shell originally added in `20260905221000`; return type expanded in `20260910180000` (drop + recreate). Prefer `get_staff_shell` for new callers.

**How it works:** Same always-one-row `LEFT JOIN` pattern as `get_staff_shell`, with column order `is_admin`, `is_editor`, `role`, `full_name`, `email`.

---

### `public.get_admin_analytics()`

| | |
| --- | --- |
| **Role** | RPC (Editor CMS Analytics page) |
| **Returns** | `jsonb` snapshot: `applications` / `registrations` / `contactMessages` inbox counts + `content` publish/status counts |
| **Security** | `SECURITY INVOKER`, `STABLE`, `search_path = public`, editor-only |
| **Granted to** | `authenticated` (raises `42501` unless `is_editor()`) |

**Details:** Replaces ~32 exact head-count PostgREST queries on the Analytics page with one RPC.

**How it works:** Raises `42501` unless `is_editor()` (`20260910180000`; previously `is_admin()`). Builds one `jsonb` with inbox totals/status/7d/30d windows (UTC `now() - interval`) and content counts matching prior TS filters (blog `status`, startup `active`, partner `is_active`, cohort/event/story `publish_status`, impact `verified`). Labels/hrefs stay in the app data layer. Added `20260905221100`.

---

### `public.get_dashboard_nav_counts()`

| | |
| --- | --- |
| **Role** | RPC (Editor sidebar record badges) |
| **Returns** | `jsonb` of table → total: `interest_registrations`, `applications`, `contact_messages`, `newsletter_subscribers`, `blogs`, `startups`, `partners`, `founder_stories`, `cohorts`, `events`, `evidence_records`, `impact_metrics`, `profiles` |
| **Security** | `SECURITY INVOKER`, `STABLE`, `search_path = public`, editor-only |
| **Granted to** | `authenticated` (raises `42501` unless `is_editor()`) |

**Details:** Replaces 13 parallel PostgREST `count: exact` head queries on the Editor layout with one round-trip. The app maps table keys to nav hrefs. The Editor layout does not await this RPC before streaming the page; badges resolve in `Suspense`. Writes that call `refreshAdminResource` also `revalidateTag('dashboard-nav-counts')`.

**How it works:** Raises `42501` unless `is_editor()`. Each value is `count(*)` on that table. Invoker, so RLS still applies — editors do not count administrator `profiles` (`20260910220000`). Added `20260910230000`.

---

### `public.get_admin_list_stats(p_resource text)`

| | |
| --- | --- |
| **Role** | RPC (Editor CMS / inbox list-page stat cards) |
| **Returns** | `jsonb` of filtered counts for one resource (camelCase keys matching the app) |
| **Security** | `SECURITY INVOKER`, `STABLE`, `search_path = public`, editor-only |
| **Granted to** | `authenticated` (raises `42501` unless `is_editor()`; `22023` on unknown `p_resource`) |

**Details:** Replaces 3–4 parallel PostgREST `count: exact` head queries per list page (blogs, partners, startups, cohorts, events, founder stories, evidence, impact metrics, applications, interest registrations, contact messages). Sidebar totals stay on `get_dashboard_nav_counts`; this RPC is one extra round-trip for the page cards, not a recount of every nav table.

**How it works:** Raises `42501` unless `is_editor()`. `CASE` on `p_resource` runs one `count(*)` + `FILTER` scan of that table. Event `upcoming` uses UTC `now()::date`. Inbox `last7Days` uses UTC `now() - 7 days`. Invoker, so RLS applies. Added `20260910250000`.

---

### `public.admin_hard_delete_user(p_target uuid)`

| | |
| --- | --- |
| **Role** | RPC (Admin Users hard-delete) |
| **Returns** | `void` |
| **Security** | `SECURITY DEFINER`, `search_path = public`, admin-only |
| **Granted to** | `authenticated` (raises unless `is_admin()`) |

**Details:** Hard-deletes a non-admin user (editors/viewers with entity links). Admins use normal flows; this path is not for deleting other admins.

**How it works:** Requires `is_admin()`. Rejects null target, self-delete, missing profile, or target `role = admin`. Deletes `evidence_records` where `owner_id = p_target` (FK `ON DELETE RESTRICT`), then deletes `auth.users` for `p_target` so the profile cascades away. Added `20260910180000`.

---

### `public.handle_new_user()`

| | |
| --- | --- |
| **Role** | Trigger function (auth signup → profile) |
| **Returns** | `trigger` |
| **Security** | `SECURITY DEFINER`, `search_path = public` |

**Details:** Creates the matching `public.profiles` row when a row is inserted into `auth.users`.

**How it works:** Reads `raw_app_meta_data.app_role` (`admin` / `editor` / `viewer`); anything else (including public signup) becomes `viewer`. Copies `id`, `email`, and display name from `raw_user_meta_data.full_name`, falling back to `raw_user_meta_data.name` (Google OAuth) when `full_name` is blank (`20260910010000`). Public clients cannot write `app_metadata`, so only Admin API–created users can get elevated roles at insert time. The `profiles.role` column default is also `viewer` (20260828191000), so an insert that bypasses this trigger cannot silently create an admin.

---

### `public.set_profiles_updated_at()`

| | |
| --- | --- |
| **Role** | Trigger function (timestamp maintenance) |
| **Returns** | `trigger` |
| **Security** | Plain `plpgsql` (invoker) |

**Details:** Keeps `profiles.updated_at` accurate on every update.

**How it works:** On `BEFORE UPDATE`, sets `NEW.updated_at = now()` and returns `NEW`.

---

### `public.prevent_unauthorized_profile_role_change()`

| | |
| --- | --- |
| **Role** | Trigger function (authorization / safety) |
| **Returns** | `trigger` |
| **Security** | `SECURITY DEFINER`, `search_path = public` |
| **Execute** | Revoked from `public`, `anon`, `authenticated` (trigger-only) |

**Details:** Stops unauthorized `role` changes via the own-profile (or staff) UPDATE path.

**How it works:** On `BEFORE UPDATE OF role`, if `NEW.role` differs from `OLD.role`: `is_admin()` may set any role; `is_editor()` may change only when both old and new are in (`editor`, `viewer`) — cannot create/promote to admin or change an admin’s role; everyone else raises `42501` with a clear message. Updated `20260910180000`.

---

## Triggers

### `on_auth_user_created`

| | |
| --- | --- |
| **Role** | Auth → profile provisioning |
| **Table** | `auth.users` |
| **Timing** | `AFTER INSERT`, `FOR EACH ROW` |
| **Calls** | `public.handle_new_user()` |

**How it works:** Every new auth user gets a linked `profiles` row automatically (role from `app_metadata.app_role` or default `viewer`).

---

### `profiles_set_updated_at`

| | |
| --- | --- |
| **Role** | Column maintenance |
| **Table** | `public.profiles` |
| **Timing** | `BEFORE UPDATE`, `FOR EACH ROW` |
| **Calls** | `public.set_profiles_updated_at()` |

**How it works:** Refreshes `updated_at` before the row is written.

---

### `profiles_protect_role`

| | |
| --- | --- |
| **Role** | Privilege escalation guard |
| **Table** | `public.profiles` |
| **Timing** | `BEFORE UPDATE OF role`, `FOR EACH ROW` |
| **Calls** | `public.prevent_unauthorized_profile_role_change()` |

**How it works:** Blocks unauthorized role column changes (admin: any role; editor: editor↔viewer only; viewers blocked), even when the own-profile UPDATE policy would otherwise allow the row update.

---

## Tables without functions / triggers

### `public.admin_perf_events`

No RPCs, functions, or triggers. Temporary CMS admin performance debug table (`ADMIN_PERF_TRACKING`). Admins INSERT/SELECT/DELETE via session client under `is_admin()` RLS. No anon grants. App instrumentation lives in `lib/admin/perf/` and must never wrap the recorder’s own inserts or the `/dashboard/performance` reads. Teardown: drop-table migration + remove instrumentation, route, and nav entry.

### `public.interest_registrations`

No RPCs, functions, or triggers. Public rows are inserted from a Server Action via the service-role client after Zod validation, Cloudflare Turnstile siteverify (`action=apply`), and in-memory rate limits (hits recorded only after a successful insert). Editors list/update/delete via the session client under `is_editor()` RLS policies.

### `public.contact_messages`

No RPCs, functions, or triggers. Public rows are inserted from a Server Action via the service-role client after Zod validation, Cloudflare Turnstile siteverify (`action=contact`), and in-memory rate limits (hits recorded only after a successful insert). Editors list/update/delete via the session client under `is_editor()` RLS policies. Length CHECKs mirror the Zod schema; there is no unique constraint on email/subject (follow-ups allowed).

### `public.blogs`

| Field | Value |
| --- | --- |
| **Name** | `public.set_blogs_updated_at` |
| **Kind** | Trigger function |
| **Role** | Invoked by trigger only |
| **Details** | Sets `updated_at = now()` on every UPDATE |

| Field | Value |
| --- | --- |
| **Name** | `public.blogs_set_updated_at` |
| **Kind** | Trigger |
| **Table** | `public.blogs` |
| **Timing** | `BEFORE UPDATE`, `FOR EACH ROW` |
| **Calls** | `public.set_blogs_updated_at()` |

**How it works:** Keeps `updated_at` current. Published rows are readable by anon/authenticated via RLS; editors CRUD via `is_editor()`. Cover images live in Storage bucket `blogs`; author avatars in `auther`. Featured exclusivity is enforced by a partial unique index plus the unfeature step inside `create_blog_with_featured` / `update_blog_with_featured` (see below) — editor writes must go through those RPCs, not a direct INSERT/UPDATE.

### `public.site_settings`

| Field | Value |
| --- | --- |
| **Name** | `public.set_site_settings_updated_at` |
| **Kind** | Trigger function |
| **Role** | Invoked by trigger only |
| **Details** | Sets `updated_at = now()` on every UPDATE |

| Field | Value |
| --- | --- |
| **Name** | `public.site_settings_set_updated_at` |
| **Kind** | Trigger |
| **Table** | `public.site_settings` |
| **Timing** | `BEFORE UPDATE`, `FOR EACH ROW` |
| **Calls** | `public.set_site_settings_updated_at()` |

**How it works:** Singleton row (`id = 1`, seeded by the migration) holding `open_applications`, `newsletter_signup_enabled`, and `backup_time`. Anonymous clients read flags via `site_settings_public` (no `backup_time`). Base table SELECT/UPDATE is staff-only (`is_staff()`). Column grant on `authenticated` excludes `backup_time` (migration `20260910240000`); admins read the schedule via `get_admin_backup_schedule`. Non-admins cannot change `backup_time` — see `protect_site_settings_backup_time` below. There is no INSERT/DELETE policy.

| Field | Value |
| --- | --- |
| **Name** | `public.protect_site_settings_backup_time` |
| **Kind** | Trigger function |
| **Role** | Invoked by trigger only |
| **Details** | Raises `42501` when a non-admin UPDATE changes `backup_time` |

| Field | Value |
| --- | --- |
| **Name** | `public.site_settings_protect_backup_time` |
| **Kind** | Trigger |
| **Table** | `public.site_settings` |
| **Timing** | `BEFORE UPDATE`, `FOR EACH ROW` |
| **Calls** | `public.protect_site_settings_backup_time()` |

**How it works:** Staff may update application/newsletter toggles; only `is_admin()` may change the backup schedule. Migration `20260910200000_site_settings_public_and_backup_guard.sql`.

| Field | Value |
| --- | --- |
| **Name** | `public.get_admin_backup_schedule` |
| **Kind** | Function (`SECURITY DEFINER`) |
| **Returns** | `backup_schedule` |
| **Details** | Raises `42501` unless `is_admin()`; otherwise returns `site_settings.backup_time` for id = 1 |
| **Execute** | `authenticated` |

**How it works:** JWT clients cannot SELECT `backup_time` (column privilege revoked). Admin UI and `runBackupNow` call this RPC instead. Migration `20260910240000_site_settings_backup_time_admin_select.sql`.

**Policy naming note:** CMS table policies still use historical `"Admins can …"` labels in older migrations even when they now call `is_editor()` / `is_staff()`. `site_settings` was renamed to staff wording in `20260910200000`; a full CMS policy rename pass was skipped as low value / high churn.

### `public.site_settings_public`

| | |
| --- | --- |
| **Role** | Public-safe settings view |
| **Columns** | `id`, `open_applications`, `newsletter_signup_enabled` |
| **Granted to** | `anon`, `authenticated` |

**Details:** Exposes marketing/intake toggles without `backup_time`. Prefer this view for anonymous Server Component reads.

### `public.startups`

| Field | Value |
| --- | --- |
| **Name** | `public.set_startups_updated_at` |
| **Kind** | Trigger function |
| **Role** | Invoked by trigger only |
| **Details** | Sets `updated_at = now()` on every UPDATE |

| Field | Value |
| --- | --- |
| **Name** | `public.startups_set_updated_at` |
| **Kind** | Trigger |
| **Table** | `public.startups` |
| **Timing** | `BEFORE UPDATE`, `FOR EACH ROW` |
| **Calls** | `public.set_startups_updated_at()` |

**How it works:** Keeps `updated_at` current. Active rows are readable by anon/authenticated via RLS; editors CRUD via `is_editor()`. Logos live in Storage bucket `startups`. Related 1:1 row in `public.startup_details` cascades on delete.

### `public.create_startup_with_details(p_core jsonb, p_details jsonb)`

| | |
| --- | --- |
| **Role** | RPC (admin portfolio create) |
| **Returns** | One row: `id` (uuid), `slug` (text) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Creates a `startups` row and its 1:1 `startup_details` row in a single transaction (no orphan core row on details failure).

**How it works:** Raises `42501` unless `is_editor()` (CMS write gate since `20260910180000`). Inserts core fields from `p_core`, then details from `p_details` (null-safe text/number casts). Unique slug violations surface as Postgres `23505`.

### `public.update_startup_with_details(p_id uuid, p_core jsonb, p_details jsonb)`

| | |
| --- | --- |
| **Role** | RPC (admin portfolio update) |
| **Returns** | One row: `id` (uuid), `slug` (text), `previous_slug` (text) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Updates core + upserts details atomically; returns previous slug so callers can revalidate renamed public paths.

**How it works:** Raises `42501` unless `is_editor()` (CMS write gate since `20260910180000`). Locks the existing row (`FOR UPDATE`); raises `P0002` if missing. Updates `startups`, then `INSERT … ON CONFLICT (startup_id) DO UPDATE` on `startup_details`.

### `public.create_blog_with_featured(p_blog jsonb)`

| | |
| --- | --- |
| **Role** | RPC (admin blog create) |
| **Returns** | One row: `id` (uuid), `slug` (text) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Unfeatures the current hero post and inserts the new post in a single transaction, so a failed insert can no longer leave the site with zero featured posts. Also persists optional Article fields: `startup_id`, `cohort_id`, `sources`, `meta_title`, `meta_description` (from `p_blog` JSON; empty strings → null / empty array).

**How it works:** Raises `42501` unless `is_editor()` (CMS write gate since `20260910180000`). Forces `is_featured = false` when `status = 'draft'`. When the new row is featured, clears `is_featured` on all other rows first — `blogs_one_featured_uidx` is a non-deferrable partial unique index, so the old hero must go before the new one lands. Stamps `published_at = now()` when published. Unique slug violations surface as Postgres `23505`.

### `public.update_blog_with_featured(p_id uuid, p_blog jsonb)`

| | |
| --- | --- |
| **Role** | RPC (admin blog update) |
| **Returns** | One row: `id` (uuid), `slug` (text), `previous_slug` (text) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Same transactional unfeature-then-write as create; returns the previous slug so callers can revalidate renamed public paths. Persists the same optional Article fields as create (`startup_id`, `cohort_id`, `sources`, `meta_title`, `meta_description`).

**How it works:** Raises `42501` unless `is_editor()` (CMS write gate since `20260910180000`). Locks the row (`FOR UPDATE`); raises `P0002` if missing. Drafts are forced unfeatured. Clears `is_featured` on every other row when this one is featured, then updates. `published_at` keeps its original value once set and is only stamped on the first publish.

### `public.handle_auth_user_updated()`

| | |
| --- | --- |
| **Role** | Trigger function (auth identity → profile) |
| **Returns** | `trigger` |
| **Security** | `SECURITY DEFINER`, `search_path = public` |
| **Execute** | Revoked from `public`, `anon`, `authenticated` (trigger-only) |

**Details:** Mirrors `auth.users.email` and display name (`raw_user_meta_data.full_name`, then `name`) into `public.profiles` so the login identity and the CMS row cannot diverge.

**How it works:** Runs inside the same transaction as the `auth.users` write, so the admin Users action makes one Auth call instead of an Auth call plus a separate profile write. A blank `full_name` / `name` falls back to the existing value (`20260910010000`). `role` is deliberately not synced: `prevent_unauthorized_profile_role_change` evaluates the session actor (`is_admin` / `is_editor`), and `auth.uid()` is null on the GoTrue connection, so a role change here would raise `42501`. Role stays a session-client write.

### `on_auth_user_updated`

| | |
| --- | --- |
| **Role** | Auth → profile identity sync |
| **Table** | `auth.users` |
| **Timing** | `AFTER UPDATE OF email, raw_user_meta_data`, `FOR EACH ROW` |
| **Calls** | `public.handle_auth_user_updated()` |

**How it works:** Fires only when identity columns change, keeping `profiles.email` / `profiles.full_name` authoritative from Auth.

### `public.get_related_published_blogs(p_slug text, p_limit integer default 3)`

| | |
| --- | --- |
| **Role** | Related posts for the public Insights detail page |
| **Returns** | `table` of the public blog list columns (no `body_html`) |
| **Security** | `sql`, `stable`, **`security invoker`**, `search_path = public` |
| **Grants** | `execute` to `anon`, `authenticated`, `service_role` |

**Details:** Replaces the previous three sequential queries in `data/blogs.ts` (read the current post's categories → same-category posts → recency top-up excluding ids already seen).

**How it works:** A CTE resolves the current post's first category. The main select scans published posts excluding `p_slug`, then orders by a rank expression — `0` when `categories @> array[primary_category]` (served by `blogs_categories_gin_idx`), else `1` — followed by `published_at desc nulls last, id`. The CTE is `left join`ed on true, so an unknown slug or a post with no categories degrades to a pure recency list instead of returning nothing. `security invoker` keeps the "Anyone can read published blogs" RLS policy in force, so drafts stay hidden from `anon`.

---

### `public.get_active_startup_filter_options()`

| | |
| --- | --- |
| **Role** | Distinct cohort / country / sector lists for the public founders filters |
| **Returns** | `jsonb` `{ cohorts: string[], countries: string[], sectors: string[] }` |
| **Security** | `sql`, `stable`, **`security invoker`**, `search_path = public` |
| **Grants** | `execute` to `anon`, `authenticated` |

**Details:** Replaces selecting every `startups_public` row's filter columns and uniquifying in JS (`data/startups.ts` → `getActiveStartupFilterOptions`).

**How it works:** Three `distinct` subqueries over `public.startups_public` (non-empty `cohort`, `country_code`, `sector`), each aggregated with `jsonb_agg(... order by value)` into a single `jsonb_build_object`. Invoker + the view's grants keep the public surface unchanged.

---

### `public.get_active_startup_country_reach()`

| | |
| --- | --- |
| **Role** | Grouped country founder counts for the home footprint graphic |
| **Returns** | `jsonb` array of `{ countryCode: string, founderCount: number }` |
| **Security** | `sql`, `stable`, **`security invoker`**, `search_path = public` |
| **Grants** | `execute` to `anon`, `authenticated` |

**Details:** Replaces selecting every `startups_public.country_code` and aggregating in JS (`data/startups.ts` → `getActiveStartupCountryReach`). Migration `20260917230000_get_active_startup_country_reach.sql`.

**How it works:** `group by country_code` over non-empty codes on `public.startups_public`, then `jsonb_agg` of `{ countryCode, founderCount }` ordered by code. Invoker + the view's grants keep the public surface unchanged.

---

### `public.blog_categories_within_bounds(categories text[])`

| | |
| --- | --- |
| **Role** | CHECK constraint helper for `public.blogs.categories` |
| **Returns** | `boolean` |
| **Security** | Plain `sql`, `immutable`, `parallel safe`, `search_path = pg_catalog` |

**Details:** Backs `blogs_categories_item_len_chk`. Exists because a CHECK constraint cannot contain a subquery, and per-element bounds on a `text[]` need `unnest`.

**How it works:** Unnests the array and returns `bool_and(char_length(category) between 1 and 40)`, defaulting to `true` for an empty or null array. Mirrors `BLOG_CATEGORY_MAX` in `validations/blog.ts`.

---

### `public.blog_sources_within_bounds(sources text[])`

| | |
| --- | --- |
| **Role** | CHECK constraint helper for `public.blogs.sources` |
| **Returns** | `boolean` |
| **Security** | Plain `sql`, `immutable` |

**Details:** Backs `blogs_sources_bounds_chk`. Exists because a CHECK constraint cannot contain a subquery, and per-element bounds on a `text[]` need `unnest`.

**How it works:** Returns true when `cardinality(sources) <= 20` and every trimmed item is between 1 and 500 characters (empty array allowed). Mirrors `BLOG_SOURCES_MAX` / `BLOG_SOURCE_MAX` in `validations/blog.ts`.

---

### `public.startup_details`

No RPCs, functions, or triggers. 1:1 child of `public.startups` (`startup_id` PK/FK, `ON DELETE CASCADE`). Public SELECT only when the parent startup `status = active`. Editors CRUD via `is_editor()`.

---

### `public.partners`

| Field | Value |
| --- | --- |
| **Name** | `public.set_partners_updated_at` |
| **Kind** | Trigger function |
| **Role** | Invoked by trigger only |
| **Details** | Sets `updated_at = now()` on every UPDATE |

| Field | Value |
| --- | --- |
| **Name** | `public.partners_set_updated_at` |
| **Kind** | Trigger |
| **Table** | `public.partners` |
| **Timing** | `BEFORE UPDATE`, `FOR EACH ROW` |
| **Calls** | `public.set_partners_updated_at()` |

**How it works:** Keeps `updated_at` current. No write RPCs — `partners` is a single flat table, so `actions/partners.ts` uses plain INSERT/UPDATE/DELETE. Every row is readable by anon/authenticated; editors CRUD via `is_editor()`. Logos live in Storage bucket `partners`.

`logo_permission` is a column-level gate that RLS cannot express, so `data/partners.ts` nulls `logo_url` before returning public rows.

---

### `public.cohorts`

| Field | Value |
| --- | --- |
| **Name** | `public.set_cohorts_updated_at` |
| **Kind** | Trigger function |
| **Role** | Invoked by trigger only |
| **Details** | Sets `updated_at = now()` on every UPDATE |

| Field | Value |
| --- | --- |
| **Name** | `public.cohorts_set_updated_at` |
| **Kind** | Trigger |
| **Table** | `public.cohorts` |
| **Timing** | `BEFORE UPDATE`, `FOR EACH ROW` |
| **Calls** | `public.set_cohorts_updated_at()` |

**How it works:** Keeps `updated_at` current. Published rows are readable by anon/authenticated via RLS; editors CRUD via `is_editor()`. Junction tables `cohort_partners` and `cohort_startups` cascade on delete. Prefer the write RPCs below so links stay in the same transaction as the cohort row. Reuses shared `cms_publish_status` when already created by another CMS migration.

### `public.create_cohort_with_links(p_cohort jsonb, p_partner_ids uuid[], p_startup_ids uuid[])`

| | |
| --- | --- |
| **Role** | RPC (admin cohort create) |
| **Returns** | One row: `id` (uuid) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Inserts a `cohorts` row and partner/startup junction rows in one transaction.

**How it works:** Raises `42501` unless `is_editor()` (CMS write gate since `20260910180000`). Inserts core fields from `p_cohort` (null-safe dates/text), then inserts each id from `p_partner_ids` / `p_startup_ids`. Unique `(year, public_label)` violations surface as Postgres `23505`.

### `public.update_cohort_with_links(p_id uuid, p_cohort jsonb, p_partner_ids uuid[], p_startup_ids uuid[])`

| | |
| --- | --- |
| **Role** | RPC (admin cohort update) |
| **Returns** | One row: `id` (uuid) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Updates the cohort and fully replaces both junction sets atomically.

**How it works:** Raises `42501` unless `is_editor()` (CMS write gate since `20260910180000`). Locks the existing row (`FOR UPDATE`); raises `P0002` if missing. Updates `cohorts`, deletes existing junction rows for `p_id`, then re-inserts from the uuid arrays.

---

### `public.events`

| Field | Value |
| --- | --- |
| **Name** | `public.set_events_updated_at` |
| **Kind** | Trigger function |
| **Role** | Invoked by trigger only |
| **Details** | Sets `updated_at = now()` on every UPDATE |

| Field | Value |
| --- | --- |
| **Name** | `public.events_set_updated_at` |
| **Kind** | Trigger |
| **Table** | `public.events` |
| **Timing** | `BEFORE UPDATE`, `FOR EACH ROW` |
| **Calls** | `public.set_events_updated_at()` |

**How it works:** Keeps `updated_at` current. Prefer the write RPCs below so `event_startups` stays in the same transaction as the event row. Published rows are readable by anon/authenticated; editors CRUD via `is_editor()`. Assets are URL strings only (no Storage bucket in Phase 5).

### `public.create_event_with_links(p_event jsonb, p_startup_ids uuid[])`

| | |
| --- | --- |
| **Role** | RPC (admin event create) |
| **Returns** | One row: `id` (uuid) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Inserts an `events` row and `event_startups` junction rows in one transaction.

**How it works:** Raises `42501` unless `is_editor()` (CMS write gate since `20260910180000`). Inserts core fields from `p_event` (null-safe location/outcomes/format; speakers/assets as jsonb string arrays), then inserts each id from `p_startup_ids`.

### `public.update_event_with_links(p_id uuid, p_event jsonb, p_startup_ids uuid[])`

| | |
| --- | --- |
| **Role** | RPC (admin event update) |
| **Returns** | One row: `id` (uuid) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Updates the event and fully replaces startup links atomically.

**How it works:** Raises `42501` unless `is_editor()` (CMS write gate since `20260910180000`). Locks the existing row (`FOR UPDATE`); raises `P0002` if missing. Updates `events`, deletes existing `event_startups` for `p_id`, then re-inserts from the uuid array.

---

### `public.event_startups`

No triggers. Composite PK `(event_id, startup_id)` with `ON DELETE CASCADE` to both parents. Public SELECT only when the related event is published. Editors write via the event link RPCs (or direct `is_editor()` policies).

---

### `public.founder_stories`

| Field | Value |
| --- | --- |
| **Name** | `public.set_founder_stories_updated_at` |
| **Kind** | Trigger function |
| **Role** | Invoked by trigger only |
| **Details** | Sets `updated_at = now()` on every UPDATE |

| Field | Value |
| --- | --- |
| **Name** | `public.founder_stories_set_updated_at` |
| **Kind** | Trigger |
| **Table** | `public.founder_stories` |
| **Timing** | `BEFORE UPDATE`, `FOR EACH ROW` |
| **Calls** | `public.set_founder_stories_updated_at()` |

**How it works:** Keeps `updated_at` current. No write RPCs — flat table with a unique `startup_id` FK, so `actions/founder-stories.ts` uses plain INSERT/UPDATE/DELETE. Published rows are readable by anon/authenticated; editors CRUD via `is_editor()`. Quote permission for public rendering is an app-layer gate (Phase 6), not RLS.

### `public.evidence_records`

| Field | Value |
| --- | --- |
| **Name** | `public.set_evidence_records_updated_at` |
| **Kind** | Trigger function |
| **Role** | Invoked by trigger only |
| **Details** | Sets `updated_at = now()` on every UPDATE |

| Field | Value |
| --- | --- |
| **Name** | `public.evidence_records_set_updated_at` |
| **Kind** | Trigger |
| **Table** | `public.evidence_records` |
| **Timing** | `BEFORE UPDATE`, `FOR EACH ROW` |
| **Calls** | `public.set_evidence_records_updated_at()` |

**How it works:** Keeps `updated_at` current. No write RPCs — editor CRUD via `actions/evidence-records.ts` and `is_editor()` RLS. Governance-only: no anon grants. Live metrics (Phase 2+) must only reference rows with `status = verified`.

### `public.impact_metrics`

| Field | Value |
| --- | --- |
| **Name** | `public.set_impact_metrics_updated_at` |
| **Kind** | Trigger function |
| **Role** | Invoked by trigger only |
| **Details** | Sets `updated_at = now()` on every UPDATE |

| Field | Value |
| --- | --- |
| **Name** | `public.impact_metrics_set_updated_at` |
| **Kind** | Trigger |
| **Table** | `public.impact_metrics` |
| **Timing** | `BEFORE UPDATE`, `FOR EACH ROW` |
| **Calls** | `public.set_impact_metrics_updated_at()` |

**How it works:** Keeps `updated_at` current. No write RPCs — editor CRUD via `actions/impact-metrics.ts` and `is_editor()` RLS. Editor CMS panel (no anon write grants). `publish_status` reuses `evidence_status`; only `verified` may render on the live site.

---

## Backup cron (ops)

Automated full-DB export is **not** a Postgres function. Hosted Supabase should enable `pg_cron` + `pg_net`, then schedule an **hourly** HTTP POST to the Next.js tick route. The app reads `site_settings.backup_time` (Asia/Beirut cadence) and decides whether to run.

### Schedule (hourly)

Run in the Supabase SQL editor after enabling extensions (Dashboard → Database → Extensions: `pg_cron`, `pg_net`):

```sql
-- Remove the old weekly job if it exists:
select cron.unschedule('asip-weekly-backup')
where exists (
  select 1 from cron.job where jobname = 'asip-weekly-backup'
);

-- Hourly tick (replace URL + secret):
select cron.schedule(
  'asip-backup-tick',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_PRODUCTION_HOST/api/cron/backup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_BACKUP_CRON_SECRET'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

**How it works:** `pg_cron` fires every hour; `pg_net` POSTs to `/api/cron/backup` with `Authorization: Bearer ${BACKUP_CRON_SECRET}` only (query-string secrets are rejected). The Node route clears stuck `pending`/`processing` rows older than 20 minutes, then loads `backup_time` via the service role (uncached). If the schedule is due in Asia/Beirut, not overlapping another job, and the schedule window has fewer than 3 failures with no success yet, it inserts one `backups` row (`scope = automated`) and exports to private R2. A partial unique index (`backups_one_in_flight_uidx`) enforces at most one in-flight row. One attempt per tick; up to 3 failures per window across hourly ticks; each failure stays visible in history. Retention: keep months M and M-1 fully; for month M-2 keep nearest-to-start/mid/end (max 3); delete older months.

**Related:** `site_settings.backup_time` (`backup_schedule` enum), `backups.schedule_window` — migration `20260906220000_backup_schedule_settings.sql`.