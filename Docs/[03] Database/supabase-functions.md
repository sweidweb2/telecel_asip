# Supabase functions, RPCs & triggers

Derived from `supabase/migrations/`. Schema tables live in `Docs/schema.dbml`.

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

**How it works:** Runs a single `EXISTS` query on `public.profiles`. Used by RLS policies so non-admins never see or edit other users’ profiles. Definer + fixed `search_path` avoids search-path hijacking while still reading profiles under elevated rights for the check.

---

### `public.get_user_stats()`

| | |
| --- | --- |
| **Role** | RPC (admin Users page stats) |
| **Returns** | One row: `total`, `admins`, `editors`, `viewers`, `new_this_week`, `new_this_month` (all `bigint`) |
| **Security** | `SECURITY INVOKER`, `STABLE`, `search_path = public`, admin-only |
| **Granted to** | `authenticated` (raises `42501` for non-admins) |

**Details:** Replaces multiple head-count queries with one round-trip for dashboard stats.

**How it works:** Raises `42501` unless `is_admin()` (added 20260828191100 — previously any authenticated caller got RLS-filtered counts, which read as real totals but were not). Then a single `SELECT` over `public.profiles` with `COUNT(*)` and filtered counts by role and by `created_at` vs UTC week/month truncations. Invoker, so RLS still applies on top of the guard.

---

### `public.handle_new_user()`

| | |
| --- | --- |
| **Role** | Trigger function (auth signup → profile) |
| **Returns** | `trigger` |
| **Security** | `SECURITY DEFINER`, `search_path = public` |

**Details:** Creates the matching `public.profiles` row when a row is inserted into `auth.users`.

**How it works:** Reads `raw_app_meta_data.app_role` (`admin` / `editor` / `viewer`); anything else (including public signup) becomes `viewer`. Copies `id`, `email`, and `raw_user_meta_data.full_name`. Public clients cannot write `app_metadata`, so only Admin API–created users can get elevated roles at insert time. The `profiles.role` column default is also `viewer` (20260828191000), so an insert that bypasses this trigger cannot silently create an admin.

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

**Details:** Stops non-admins from promoting or changing their own `role` via the own-profile UPDATE policy.

**How it works:** On `BEFORE UPDATE OF role`, if `NEW.role` differs from `OLD.role` and `is_admin()` is false, raises SQLSTATE `42501`. Admins pass because `is_admin()` evaluates the authenticated actor.

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

**How it works:** Blocks role column changes unless the current user is an admin, even when the own-profile UPDATE policy would otherwise allow the row update.

---

## Tables without functions / triggers

### `public.admin_perf_events`

No RPCs, functions, or triggers. Temporary CMS admin performance debug table (`ADMIN_PERF_TRACKING`). Admins INSERT/SELECT/DELETE via session client under `is_admin()` RLS. No anon grants. App instrumentation lives in `lib/admin/perf/` and must never wrap the recorder’s own inserts or the `/dashboard/performance` reads. Teardown: drop-table migration + remove instrumentation, route, and nav entry.

### `public.interest_registrations`

No RPCs, functions, or triggers. Public rows are inserted from a Server Action via the service-role client after Zod validation, Cloudflare Turnstile siteverify (`action=apply`), and in-memory rate limits (hits recorded only after a successful insert). Admins list/update/delete via the session client under `is_admin()` RLS policies.

### `public.contact_messages`

No RPCs, functions, or triggers. Public rows are inserted from a Server Action via the service-role client after Zod validation, Cloudflare Turnstile siteverify (`action=contact`), and in-memory rate limits (hits recorded only after a successful insert). Admins list/update/delete via the session client under `is_admin()` RLS policies. Length CHECKs mirror the Zod schema; there is no unique constraint on email/subject (follow-ups allowed).

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

**How it works:** Keeps `updated_at` current. Published rows are readable by anon/authenticated via RLS; admins CRUD via `is_admin()`. Cover images live in Storage bucket `blogs`; author avatars in `auther`. Featured exclusivity is enforced by a partial unique index plus the unfeature step inside `create_blog_with_featured` / `update_blog_with_featured` (see below) — admin writes must go through those RPCs, not a direct INSERT/UPDATE.

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

**How it works:** Singleton row (`id = 1`, seeded by the migration) holding `open_applications`. Readable by anon and authenticated so the marketing navbar and middleware can route between `/apply` and `/register-interest`; only `is_admin()` may UPDATE, and there is no INSERT/DELETE policy.

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

**How it works:** Keeps `updated_at` current. Active rows are readable by anon/authenticated via RLS; admins CRUD via `is_admin()`. Logos live in Storage bucket `startups`. Related 1:1 row in `public.startup_details` cascades on delete.

### `public.create_startup_with_details(p_core jsonb, p_details jsonb)`

| | |
| --- | --- |
| **Role** | RPC (admin portfolio create) |
| **Returns** | One row: `id` (uuid), `slug` (text) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Creates a `startups` row and its 1:1 `startup_details` row in a single transaction (no orphan core row on details failure).

**How it works:** Raises `42501` unless `is_admin()`. Inserts core fields from `p_core`, then details from `p_details` (null-safe text/number casts). Unique slug violations surface as Postgres `23505`.

### `public.update_startup_with_details(p_id uuid, p_core jsonb, p_details jsonb)`

| | |
| --- | --- |
| **Role** | RPC (admin portfolio update) |
| **Returns** | One row: `id` (uuid), `slug` (text), `previous_slug` (text) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Updates core + upserts details atomically; returns previous slug so callers can revalidate renamed public paths.

**How it works:** Raises `42501` unless `is_admin()`. Locks the existing row (`FOR UPDATE`); raises `P0002` if missing. Updates `startups`, then `INSERT … ON CONFLICT (startup_id) DO UPDATE` on `startup_details`.

### `public.create_blog_with_featured(p_blog jsonb)`

| | |
| --- | --- |
| **Role** | RPC (admin blog create) |
| **Returns** | One row: `id` (uuid), `slug` (text) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Unfeatures the current hero post and inserts the new post in a single transaction, so a failed insert can no longer leave the site with zero featured posts. Also persists optional Article fields: `startup_id`, `cohort_id`, `sources`, `meta_title`, `meta_description` (from `p_blog` JSON; empty strings → null / empty array).

**How it works:** Raises `42501` unless `is_admin()`. Forces `is_featured = false` when `status = 'draft'`. When the new row is featured, clears `is_featured` on all other rows first — `blogs_one_featured_uidx` is a non-deferrable partial unique index, so the old hero must go before the new one lands. Stamps `published_at = now()` when published. Unique slug violations surface as Postgres `23505`.

### `public.update_blog_with_featured(p_id uuid, p_blog jsonb)`

| | |
| --- | --- |
| **Role** | RPC (admin blog update) |
| **Returns** | One row: `id` (uuid), `slug` (text), `previous_slug` (text) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Same transactional unfeature-then-write as create; returns the previous slug so callers can revalidate renamed public paths. Persists the same optional Article fields as create (`startup_id`, `cohort_id`, `sources`, `meta_title`, `meta_description`).

**How it works:** Raises `42501` unless `is_admin()`. Locks the row (`FOR UPDATE`); raises `P0002` if missing. Drafts are forced unfeatured. Clears `is_featured` on every other row when this one is featured, then updates. `published_at` keeps its original value once set and is only stamped on the first publish.

### `public.handle_auth_user_updated()`

| | |
| --- | --- |
| **Role** | Trigger function (auth identity → profile) |
| **Returns** | `trigger` |
| **Security** | `SECURITY DEFINER`, `search_path = public` |
| **Execute** | Revoked from `public`, `anon`, `authenticated` (trigger-only) |

**Details:** Mirrors `auth.users.email` and `raw_user_meta_data.full_name` into `public.profiles` so the login identity and the CMS row cannot diverge.

**How it works:** Runs inside the same transaction as the `auth.users` write, so the admin Users action makes one Auth call instead of an Auth call plus a separate profile write. A blank `full_name` falls back to the existing value. `role` is deliberately not synced: `prevent_unauthorized_profile_role_change` calls `is_admin()`, and `auth.uid()` is null on the GoTrue connection, so a role change here would raise `42501`. Role stays a session-client write.

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

No RPCs, functions, or triggers. 1:1 child of `public.startups` (`startup_id` PK/FK, `ON DELETE CASCADE`). Public SELECT only when the parent startup `status = active`. Admins CRUD via `is_admin()`.

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

**How it works:** Keeps `updated_at` current. No write RPCs — `partners` is a single flat table, so `actions/partners.ts` uses plain INSERT/UPDATE/DELETE. Every row is readable by anon/authenticated; admins CRUD via `is_admin()`. Logos live in Storage bucket `partners`.

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

**How it works:** Keeps `updated_at` current. Published rows are readable by anon/authenticated via RLS; admins CRUD via `is_admin()`. Junction tables `cohort_partners` and `cohort_startups` cascade on delete. Prefer the write RPCs below so links stay in the same transaction as the cohort row. Reuses shared `cms_publish_status` when already created by another CMS migration.

### `public.create_cohort_with_links(p_cohort jsonb, p_partner_ids uuid[], p_startup_ids uuid[])`

| | |
| --- | --- |
| **Role** | RPC (admin cohort create) |
| **Returns** | One row: `id` (uuid) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Inserts a `cohorts` row and partner/startup junction rows in one transaction.

**How it works:** Raises `42501` unless `is_admin()`. Inserts core fields from `p_cohort` (null-safe dates/text), then inserts each id from `p_partner_ids` / `p_startup_ids`. Unique `(year, public_label)` violations surface as Postgres `23505`.

### `public.update_cohort_with_links(p_id uuid, p_cohort jsonb, p_partner_ids uuid[], p_startup_ids uuid[])`

| | |
| --- | --- |
| **Role** | RPC (admin cohort update) |
| **Returns** | One row: `id` (uuid) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Updates the cohort and fully replaces both junction sets atomically.

**How it works:** Raises `42501` unless `is_admin()`. Locks the existing row (`FOR UPDATE`); raises `P0002` if missing. Updates `cohorts`, deletes existing junction rows for `p_id`, then re-inserts from the uuid arrays.

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

**How it works:** Keeps `updated_at` current. Prefer the write RPCs below so `event_startups` stays in the same transaction as the event row. Published rows are readable by anon/authenticated; admins CRUD via `is_admin()`. Assets are URL strings only (no Storage bucket in Phase 5).

### `public.create_event_with_links(p_event jsonb, p_startup_ids uuid[])`

| | |
| --- | --- |
| **Role** | RPC (admin event create) |
| **Returns** | One row: `id` (uuid) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Inserts an `events` row and `event_startups` junction rows in one transaction.

**How it works:** Raises `42501` unless `is_admin()`. Inserts core fields from `p_event` (null-safe location/outcomes/format; speakers/assets as jsonb string arrays), then inserts each id from `p_startup_ids`.

### `public.update_event_with_links(p_id uuid, p_event jsonb, p_startup_ids uuid[])`

| | |
| --- | --- |
| **Role** | RPC (admin event update) |
| **Returns** | One row: `id` (uuid) |
| **Security** | `SECURITY INVOKER`, `search_path = public` |
| **Granted to** | `authenticated` |

**Details:** Updates the event and fully replaces startup links atomically.

**How it works:** Raises `42501` unless `is_admin()`. Locks the existing row (`FOR UPDATE`); raises `P0002` if missing. Updates `events`, deletes existing `event_startups` for `p_id`, then re-inserts from the uuid array.

---

### `public.event_startups`

No triggers. Composite PK `(event_id, startup_id)` with `ON DELETE CASCADE` to both parents. Public SELECT only when the related event is published. Admins write via the event link RPCs (or direct `is_admin()` policies).

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

**How it works:** Keeps `updated_at` current. No write RPCs — flat table with a unique `startup_id` FK, so `actions/founder-stories.ts` uses plain INSERT/UPDATE/DELETE. Published rows are readable by anon/authenticated; admins CRUD via `is_admin()`. Quote permission for public rendering is an app-layer gate (Phase 6), not RLS.

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

**How it works:** Keeps `updated_at` current. No write RPCs — admin CRUD via `actions/evidence-records.ts` and `is_admin()` RLS. Governance-only: no anon grants. Live metrics (Phase 2+) must only reference rows with `status = verified`.

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

**How it works:** Keeps `updated_at` current. No write RPCs — admin CRUD via `actions/impact-metrics.ts` and `is_admin()` RLS. Admin-only until Phase 6 (no anon grants). `publish_status` reuses `evidence_status`; only `verified` may render on the live site.