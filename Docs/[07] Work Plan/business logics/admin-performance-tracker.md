## Admin performance tracker

Temporary CMS debug instrumentation. Records layout/page/action/data timings into `public.admin_perf_events` and surfaces them at `/dashboard/performance`. Product Analytics (`/dashboard/analytics`) stays separate.

---

### Kill switch

| Env | Effect |
| --- | --- |
| `ADMIN_PERF_TRACKING=true` | Wrappers record events (fire-and-forget insert) |
| unset / any other value | No-ops; Performance UI shows “tracking off” and empty data |

Committed `.env.example` documents the flag (default off / commented). Local `.env` must set it explicitly and the Next server must be restarted after changes.

---

### Storage

Table: `public.admin_perf_events` (migration `20260905210000_admin_perf_events.sql`).

| Column | Role |
| --- | --- |
| `id` | Event PK |
| `created_at` | Insert time |
| `request_id` | Correlates spans in one RSC / Server Action invocation (`nanoid` via React.cache store) |
| `parent_id` | Optional parent span (reserved) |
| `event_type` | `layout` \| `page` \| `action` \| `data_read` \| `option_load` \| `mutation` \| `upload` |
| `name` | Stable op name (`getBlogsPageData`, `uploadStartupLogo`, …) |
| `route` | Path when known (`/dashboard/blogs`, …) |
| `duration_ms` | Wall time of the wrapped `fn` |
| `db_ms` | Reserved (null today) |
| `cache_status` | `hit` \| `miss` \| `bypass` \| `n_a` |
| `ok` | `false` if `fn` threw |
| `error_message` | Truncated throw message |
| `meta` | Small JSON (args summary, invoke count) — no secrets / file buffers / PII bodies |

**RLS:** authenticated SELECT / INSERT / DELETE only when `is_admin()`. No anon grants. Inserts use the session `createClient()` so RLS applies.

---

### Core flow (`lib/admin/perf/`)

1. **`isAdminPerfTrackingEnabled()`** — env gate.
2. **`getAdminPerfRequestStore()`** — React.cache store: `requestId`, `route`, per-key invoke counts.
3. **`traceAsync(name, attrs, fn)`**
   - Flag off → run `fn` only.
   - Route is `/dashboard/performance` → run `fn` only (no recursion / self-spam).
   - Otherwise time `fn`, then **void** `persistAdminPerfEvent` (never awaited; failures only `console.error`).
4. **`wrapCached(name, opts, cachedFn)`** — place *outside* `React.cache(...)`. First await of a key → `miss`; later awaits of the same key in the request → `hit` (proves metadata + page body sharing).
5. **`persistAdminPerfEvent`** — never wrapped in `traceAsync`; caps `meta` / error length.

---

### What is instrumented

| Layer | Location | `event_type` |
| --- | --- | --- |
| Dashboard layout | `app/(dashboard)/layout.tsx` | `layout` (admin check ∥ profile) |
| List page shell | `loadAdminListPage` | `page` |
| List/detail gate | `gateAdminPageData` | `data_read` (optional `name`) |
| Mutations | `runAdminMutation` | `mutation` |
| Authorize | `authorizeAdmin` | `data_read` |
| Uploads | blog / startup / partner upload actions | `upload` |
| Admin readers | `data/*` pageData, `get*ByIdForAdmin` (`wrapCached`), option/picker loaders | `data_read` / `option_load` |

**Never traced:** `data/admin-perf-events.ts`, recorder inserts, Performance page reads, public marketing `unstable_cache` readers (unless called from admin).

---

### UI (`/dashboard/performance`)

- Nav: System → Performance.
- Flag off: explanation card; no writes from this page.
- Flag on: last 24h events. Charts use up to 1000 newest window rows. The table is URL-paginated (10/25/50/100 per page, numbered pages) with type / cache / name filters. Row → dialog with `meta` + same-`request_id` waterfall.
- Charts (recharts): slowest names hit vs miss avg, events over time, count by `event_type`, overall hit ratio.
- Hygiene action: delete rows older than 7 days (`actions/admin-perf-events.ts`).

**How to read cache**

- `hit` — React.cache / request dedupe reused work (await was cheap).
- `miss` — first compute of that key in the request.
- `n_a` — not a cached loader (layout, mutation, most gates).
- Charts treat miss + `n_a` as “real work” series vs hits.

---

### Safety

- Persist failures never fail the user request.
- Meta size capped; no passwords, tokens, email bodies, or file buffers.
- Temporary: teardown = drop-table migration + delete `lib/admin/perf` + unwrap call sites + remove route/nav + update schema docs. See `lib/admin/perf/README.md`.

---

### Verification checklist

1. Flag off → no new rows; CMS UX unchanged.
2. Flag on → browse lists/details, save a form, upload an image → rows appear; dialog groups by `request_id`.
3. Opening `/dashboard/performance` does not flood the table with its own list/analytics reads.
4. `npm run typecheck`; Vitest `cacheStatusFromInvokeCount` (first invoke miss, later hit).

---

### Live table check (linked Supabase, 2026-09-05)

Queried `public.admin_perf_events` after CMS use with `ADMIN_PERF_TRACKING=true`.

| Check | Result |
| --- | --- |
| Row count | ~140+ (growing while browsing) |
| `route` like `%/performance%` | **0** — no self-spam from Performance page reads |
| Names like `%admin_perf%` | **0** — recorder not tracing itself |
| `cache_status` | hits and misses both present (`wrapCached` working); most rows `n_a` (expected) |
| Event mix | `data_read`, `page`, `layout`, `option_load`, `mutation`, `upload` all present |
| Request grouping | Same `request_id` ties layout + page + data (and ById miss+hit pairs) |

**Issue found — fixed in code:** 3 rows with `ok = false` for `getAdminAnalytics`, `error_message = '[object Object]'`. PostgREST errors are plain objects; `traceAsync` used `String(err)`. Serialization now prefers `message` / `code` / `details` or `JSON.stringify`. Re-hit Analytics after deploy/restart to see a real message if it still fails.

**Not a tracker bug:** concurrent ById miss+hit can show similar `duration_ms` (both await the same in-flight promise). Sequential hits (e.g. blog ById ~75 ms hit) show the cheap path.

**Perf signals (for CMS work, not tracker defects):** layout/list cold paths up to ~2.6 s; `uploadPartnerLogo` ~2.3 s; one contact list request summed ~7.8 s across spans — investigate separately if UX still feels slow.

---

### Shell / analytics RPC (2026-09-05)

High-impact follow-up from the live table signals:

| Change | Expected tracker signal |
| --- | --- |
| Layout uses `get_admin_shell` via `getAdminShell()` | `dashboardLayout` → one round-trip (`ops: ["getAdminShell"]`) instead of `is_admin` ∥ profile |
| Analytics uses `get_admin_analytics` | Single `getAdminAnalytics` `data_read` span; no ~32 count fan-out |
| Editor option loads | No `option_load` on editor mount; first load on search/picker focus |
| Inbox ILIKE | Trigram GIN indexes only (no app change); measure search lists after migrate |

Measure with **`npm run build && npm run start`** and `ADMIN_PERF_TRACKING=true` — not `next dev` / Turbopack — so timings are comparable.
