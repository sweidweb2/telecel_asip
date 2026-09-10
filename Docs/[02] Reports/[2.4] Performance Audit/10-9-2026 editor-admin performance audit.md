# Editor & Admin panel performance audit

**Date:** 10 September 2026  
**Scope:** Editor panel (`/dashboard/*`) and Admin panel (`/admin/*`) — layouts, chrome, list pages, editor forms, and the data/actions they call. Marketing / public site is out of scope.  
**Method:** The 100 prompts in `Docs/[10] Skills/performance-audit.md`, applied as an audit (problems only; no code changes in this pass).  
**Related:** `Docs/[07] Work Plan/business logics/admin-performance-tracker.md`

---

## Verdict

| Question | Answer |
| --- | --- |
| Is the staff CMS broken on speed? | **Editor navigations are the hot path.** The layout waits on auth, then **13 exact-count queries**, before the page can stream. |
| Admin panel vs editor? | Admin shell is lighter (no badge counts). Same list/table/form patterns still apply on Users. |
| Blocking ship? | **P0.1** (editor layout waterfall) is the one that users feel on every click. **P0.2** (Performance route self-redirect) blocks measuring the rest. |
| Already in good shape? | Yes: paginated lists, search debounce, `Promise.all` on list+stats, TipTap/Recharts dynamic import, `React.cache` on `getStaffShell`, no `select('*')`, route `loading.tsx` on almost every page. |

**Highest-impact fix order**

1. Stop blocking the editor shell on 13 nav-count queries (Suspense, defer badges, or one RPC + short TTL).
2. Restore `/admin/performance` (it currently redirects to itself).
3. Cap / stream inbox CSV export; narrow list payloads; mount inbox dialogs once, not per row.
4. Drop `forceMount` on CMS steppers so inactive steps are not live.

---

## How this report is organized

Problems only. Each item has:

- **Where** — editor shell, admin shell, both, or a named page
- **Prompts** — numbers from `performance-audit.md`
- **Evidence** — files
- **Why it hurts**
- **What to do**

Severity: **P0** user-visible on every (or most) navigations · **P1** specific heavy flows · **P2** waste that grows with data or extra renders.

---

# P0 — Fix first

### P0.1 Editor layout waits on shell, then 13 count queries, before any page

| | |
| --- | --- |
| **Where** | Editor shell — every `/dashboard/*` request |
| **Prompts** | 17, 24, 49, 50, 56, 60, 75 |
| **Admin?** | No. Admin layout only calls `getStaffShell()`. |

**Evidence**

- `app/(unlocalized)/(dashboard)/layout.tsx` — awaits `getStaffShell()`, then awaits `getDashboardNavCounts()`, then renders sidebar + header + children.
- `data/dashboard-nav-counts.ts` — 13 parallel `select("id", { count: "exact", head: true })` queries (registrations, applications, contact, newsletter, blogs, startups, partners, stories, cohorts, events, evidence, impact, profiles).
- Counts are only `React.cache`’d for **one request**. The next navigation pays all 13 again.
- Layout data blocks streaming: `{children}` cannot start until counts finish.

**Why it hurts**

This is the tax on every editor click. Opening Partners still pays the 13 layout counts **plus** that page’s own list + 4 stats counts.

**What to do**

- Render the shell (sidebar + header) without waiting for badges; wrap counts in `Suspense` (or a client island).
- Better: one RPC / view that returns all badge counts in a single round-trip.
- Cache counts across requests (`unstable_cache` + tags, TTL ~15–60s) and invalidate on the same writes that already call `refreshAdminResource`.

---

### P0.2 `/admin/performance` redirects to itself

| | |
| --- | --- |
| **Where** | Admin → System → Performance |
| **Prompts** | 95, 96 (cannot measure) |

**Evidence**

`app/(unlocalized)/(admin)/admin/performance/page.tsx` is a bookmark redirect to `ROUTES.adminPerformance` (`/admin/performance`). The editor bookmark at `dashboard/performance/page.tsx` correctly redirects to admin; the **admin page is the same redirect**, so the route loops.

The UI still exists (`components/dashboard/admin-perf-dashboard.tsx`, `data/admin-perf-events.ts`, `loading.tsx`) but is unreachable.

**Why it hurts**

Staff cannot open the in-app timing dashboard. You cannot validate layout/page traces until this page is restored.

**What to do**

Restore the real Performance page (load events + analytics, render `AdminPerfDashboard`). Keep the dashboard `/dashboard/performance` redirect only.

---

# P1 — High impact

### P1.1 Duplicate counting: sidebar badges + page stat cards

| | |
| --- | --- |
| **Where** | Editor list pages (Blogs, Partners, Portfolio, Cohorts, Events, …) |
| **Prompts** | 56, 75, 78 |

**Evidence**

Layout already counted `blogs`, `partners`, etc. Each list page then runs 3–4 more exact counts for stat cards (e.g. `data/blogs.ts` `fetchBlogListStats`: total / published / draft / featured). Inbox lists add four more via `data/inbox-stats.ts`.

**Why it hurts**

Opening one list can be **17+ count queries** (13 nav + 4 page stats) plus the list select.

**What to do**

Reuse layout counts for the “total” card, or fold list stats into one RPC (Analytics already does this with `get_admin_analytics`).

---

### P1.2 Inbox / Users tables mount a form + dialogs on every row

| | |
| --- | --- |
| **Where** | Editor: Applications, Registrations, Contact us. Both panels: Users |
| **Prompts** | 1, 3, 12, 13 |

**Evidence**

| Table | Pattern |
| --- | --- |
| `components/applications/applications-table.tsx` | Parent `viewId` + map of `ApplicationRowActions` |
| `components/applications/application-row-actions.tsx` | `useForm` + view **and** edit `Dialog`s per row |
| `components/registrations/*` | Same |
| `components/contact-messages/*` | Same |
| `components/users/users-table.tsx` + `user-dialogs.tsx` | `useForm` + view/edit/delete dialogs per row |

Opening one dialog re-renders **all** rows (shared `viewId` / `editUserId`). No `React.memo` on row components.

**Why it hurts**

10–20 rows × (RHF + two dialogs) on first paint. Typing in search (after debounce) or opening View is heavier than it needs to be.

**What to do**

One shared view/edit dialog at table level. Pass the selected row in. Mount `useForm` only when that dialog is open. Same pattern already used on the Performance events table.

---

### P1.3 Inbox list queries ship full long-text columns into the client table

| | |
| --- | --- |
| **Where** | Editor Applications, Registrations, Contact us |
| **Prompts** | 48, 71 |

**Evidence**

List selects include the dialog bodies:

- Applications: `problem_product`, `traction`, `programme_fit` (`data/applications.ts`)
- Registrations: `pitch` (`data/interest-registrations.ts`)
- Contact: `message` (`data/contact-messages.ts`)

Those fields exist so per-row dialogs can open without a second fetch (see P1.2).

**Why it hurts**

RSC → client payload grows with essay-length answers, for a table that only shows name / email / company / date.

**What to do**

List columns = table columns. Load the long fields when the shared dialog opens (Server Action or a small `get*ById`).

---

### P1.4 Unbounded inbox CSV export on the request path

| | |
| --- | --- |
| **Where** | Editor inbox “Export CSV” → `GET /api/admin/export/[table]` |
| **Prompts** | 52, 80, 85, 86 |

**Evidence**

`app/api/admin/export/[table]/route.ts` selects **all** rows (no `.range` / `.limit`), builds the full CSV string in memory, then returns it.

**Why it hurts**

Fine at dozens of leads; slow and memory-heavy at thousands. Can stall a Node instance.

**What to do**

Cap pages / stream rows; or reuse the backup job path (`after()` / background) for large exports.

---

### P1.5 CMS editor steppers keep every step mounted (`forceMount`)

| | |
| --- | --- |
| **Where** | Editor create/edit forms |
| **Prompts** | 13, 19, 42 |

**Evidence**

`components/ui/stepper.tsx` — `forceMount` keeps inactive panels in the DOM (`hidden`). Used on:

- Startups, Partners, Founder stories, Impact metrics, Evidence (3 steps)
- Events, Cohorts (2 steps)

Inactive steps still mount EntitySelect / MultiSelect, file inputs, sort-order maps, help dialogs.

**Why it hurts**

First paint of “New startup” / “Edit partner” pays for all steps, including ones the user may never open.

**What to do**

Mount the active step only (drop `forceMount`), or lazy-mount the next step. Keep values in RHF so leaving a step does not lose data. Validate on Continue rather than requiring every field to be in the DOM.

---

### P1.6 Sidebar logo is a 141KB PNG, two `priority` images, displayed at 32px

| | |
| --- | --- |
| **Where** | Both shells (`AppSidebar`) |
| **Prompts** | 25, 26, 27, 28, 97 |

**Evidence**

`components/dashboard/app-sidebar.tsx` — `ASIP_LOGO.png` (`width={864}` `height={289}` `priority`) shown at `h-8`, plus a second `priority` `icon.png`. Source file is ~141KB.

**Why it hurts**

Competes with LCP on every staff load. The displayed size is ~160×32 CSS pixels.

**What to do**

Ship a small WebP/AVIF (or SVG) for the sidebar. `priority` on the visible variant only. Do not send the 864px asset.

---

# P2 — Medium / polish

### P2.1 Admin group has no shell `loading.tsx`

| | |
| --- | --- |
| **Where** | Admin first paint |
| **Prompts** | 14, 21, 24 |

**Evidence**

Editor group has `app/(unlocalized)/(dashboard)/loading.tsx` (sidebar + header skeleton) while the layout auth runs. Admin group has **no** matching file. Nested routes (`users`, `backup`, `settings`, `performance`) have page `loading.tsx`, which only helps **after** the layout resolves.

**What to do**

Copy the dashboard group skeleton to `app/(unlocalized)/(admin)/loading.tsx`.

---

### P2.2 Blog CMS list selects columns the table never shows

| | |
| --- | --- |
| **Where** | Editor Blogs list |
| **Prompts** | 48, 71 |

**Evidence**

`data/blogs.ts` `LIST_COLUMNS` includes `summary`, `categories`, `thumbnail_url`, `sources`, `meta_title`, `meta_description`, `startup_id`, `cohort_id`, `reading_time_minutes`, `published_at`, `author_avatar_url`.

`components/blogs/blogs-table.tsx` shows title, status, author, updated, actions.

**What to do**

Narrow the list select to what the table and row actions need (`id`, `title`, `status`, `is_featured`, `author_name`, `updated_at`).

---

### P2.3 Detail loaders wait for the main row before related rows (id is already in the URL)

| | |
| --- | --- |
| **Where** | Editor `[id]` pages (worst: Cohorts; same pattern on Events / Startups / etc.) |
| **Prompts** | 49, 50 |

**Evidence**

`data/cohorts.ts` `getCohortByIdForAdmin`: editor check → cohort select → **then** `Promise.all` of `cohort_partners` + `cohort_startups`. Link queries only need the URL `id`.

`isCurrentUserEditor()` is `React.cache`’d with the layout, so the **auth** await is cheap. The extra **network** hop is the related-table wait.

**What to do**

`Promise.all` the main row and link tables using the route id (same pattern list pages already use in `gateEditorPageData`).

---

### P2.4 Partner sort-order map loads every partner and paints 170 slot buttons

| | |
| --- | --- |
| **Where** | Editor Partner create/edit |
| **Prompts** | 5, 52, 80 |

**Evidence**

- `data/partners.ts` `getPartnerSortOrderOccupants` — unbounded `select("id, name, sort_order")` (no limit).
- `PARTNER_SORT_ORDER_PAGE_SIZE = 170` equals `PARTNER_SORT_ORDER_MAX`, so `getPartnerSortOrderPageCount()` is 1.
- `components/partners/partner-sort-order-map.tsx` renders all 170 slot `<button>`s when the accordion is open.

**What to do**

Keep a real page size (e.g. 34) so one screen is a slice. Occupants query can stay (170 ids is small) but should stay capped at `PARTNER_SORT_ORDER_MAX`.

---

### P2.5 Suggest inputs listen to every scroll/resize without throttle

| | |
| --- | --- |
| **Where** | Editor forms (partners, events, founder stories, shared suggest) |
| **Prompts** | 7, 9 |

**Evidence**

`components/dashboard/suggest-input.tsx` (and copies: event location, partner contribution, founder attribution): while the list is open, `resize` + capture-phase `scroll` call `getBoundingClientRect` on every event.

**What to do**

`requestAnimationFrame` (or a short throttle). Disconnect on close (already done).

---

### P2.6 Image processing runs inside the upload Server Action

| | |
| --- | --- |
| **Where** | Editor uploads (blog cover, startup logo, partner logo) |
| **Prompts** | 10, 85, 87 |

**Evidence**

`processImageBuffer` (Sharp) is awaited in `actions/blogs.ts`, `actions/startups.ts`, `actions/partners.ts` before the action returns. Project rules require Sharp on Node (not Edge); backups already use `after()` for slow work.

**Why it hurts**

The save button stays pending for resize + WebP + Storage, not just the DB write.

**What to do**

Keep Sharp on Node. Optionally: store the original, return fast, process in `after()` / a job, then swap the versioned path (harder UX). Simpler: show a dedicated “processing image” pending state so the wait is honest.

---

### P2.7 Inbox archive waits for the server (no optimistic UI)

| | |
| --- | --- |
| **Where** | Editor inbox row actions |
| **Prompts** | 15, 18 |

**Evidence**

`components/dashboard/admin-inbox-archive-button.tsx` — `startTransition` → Server Action → toast → `router.refresh()`. Partner flags and blog status toggles **do** update locally first.

**What to do**

Same optimistic pattern as `partner-flag-toggles` / `blog-status-toggle`, with rollback on error.

---

### P2.8 Middleware `getUser` + layout `get_staff_shell` on every staff navigation

| | |
| --- | --- |
| **Where** | Both shells |
| **Prompts** | 50, 51 |

**Evidence**

`middleware.ts` refreshes the Supabase session (`auth.getUser`) for `/dashboard` and `/admin`. Layouts then call `get_staff_shell`. Page gates reuse `React.cache` (good). Middleware and RSC do **not** share that cache.

**Why it hurts**

Two auth-ish round-trips before page data. Hard to collapse without weakening the login gate.

**What to do**

Keep middleware as the unauthenticated redirect. Do not add a third role RPC. Optional later: JWT app_metadata role so the layout can skip the shell RPC for chrome-only renders (role still re-checked on mutations).

---

### P2.9 Shared sidebar context re-renders all chrome on toggle

| | |
| --- | --- |
| **Where** | Both shells |
| **Prompts** | 4 |

**Evidence**

`components/ui/sidebar.tsx` — one context object (`open`, `openMobile`, `isMobile`, `state`, …). `AppSidebar` and `AdminEditorActionsBar` both subscribe. Collapsing the rail re-renders the whole nav tree.

**What to do**

Split “mobile open” from “desktop collapsed” if profiling shows it on the actions bar. Low urgency; few consumers.

---

### P2.10 Header command search is not debounced

| | |
| --- | --- |
| **Where** | Both shells — `DashboardPageSearch` |
| **Prompts** | 6, 8 |

**Evidence**

`components/dashboard/dashboard-page-search.tsx` filters a tiny in-memory catalog on every keystroke (`setQuery` → `setResults` → `setActiveIndex` → `setOpen`). List-page search **is** debounced (400ms) in `hooks/use-admin-list-filters.ts`.

**What to do**

Optional: one state object. Not worth debounce at this catalog size.

---

### P2.11 Blog CMS search has no trigram index on title / author

| | |
| --- | --- |
| **Where** | Editor Blogs search |
| **Prompts** | 69, 72 |

**Evidence**

Blogs list `or(title.ilike, slug.ilike, author_name.ilike)`. Indexes exist for slug uniqueness, status/published_at, created_at, categories GIN — **not** `title` / `author_name` trigram. Inbox tables already have trgm indexes (`20260905221200_inbox_search_trgm_idx.sql`). Partners/startups have name trgm.

**What to do**

Add `blogs_title_trgm_idx` / `blogs_author_name_trgm_idx` when blog volume grows. Fine at current CMS size.

---

### P2.12 List pagination is OFFSET (`range`), not cursor

| | |
| --- | --- |
| **Where** | All CMS lists (both panels) |
| **Prompts** | 73 |

**Evidence**

`lib/admin/admin-list-query.ts` `adminListRange` → PostgREST `.range(from, to)`. Page sizes are 10–25 (backup up to 50, perf table up to 100).

**What to do**

Leave OFFSET until a list is routinely deep-paged. Not a problem at current volume.

---

### P2.13 No RUM, no CI performance budget, Performance page unreachable

| | |
| --- | --- |
| **Where** | Measurement (both panels) |
| **Prompts** | 95, 96, 97, 98, 99, 100 |

**Evidence**

- No `web-vitals` / Lighthouse CI / bundle-size budget in `package.json`.
- `@next/bundle-analyzer` exists (`ANALYZE=true`) but is not gated in CI.
- In-app tracker (`ADMIN_PERF_TRACKING`) is the right lab tool — but see **P0.2**.

**What to do**

Restore the Performance page first. Then: enable tracking in staging, capture a baseline (layout vs page vs data_read). Add a CI bundle budget for the staff client chunks later.

---

# Already healthy (do not “fix”)

These prompts were checked against editor/admin and are **not** problems today:

| Area | What is already true |
| --- | --- |
| Narrow selects | No `select('*')` in `data/` for these screens |
| List parallelism | `gateEditorPageData` / `gateAdminPageData` run auth ∥ payload; list+stats use `Promise.all` |
| Pagination | CMS lists use `adminListRange` (10–25 typical) |
| Search debounce | List filters: 400ms. Option pickers: 300ms |
| Auth dedupe | `getStaffShell` + `isCurrentUserEditor` / `Admin` / `Staff` are `React.cache` |
| Heavy widgets | Recharts via `next/dynamic` in `admin-perf-dashboard.tsx`; TipTap via `next/dynamic` in `blog-editor-form.tsx` |
| Route loading | Colocated `loading.tsx` on editor list / new / `[id]` and admin users / backup / settings |
| Forms | Editors and dialogs use RHF + Zod, not per-field `useState` |
| Images in tables | Partner/startup logos use `next/image` + `sizes`; `<img>` only for local blob previews |
| Fonts | Root `next/font/local` + `display: "swap"` — no extra fonts in staff layouts |
| Cache-Control | `/dashboard/*` and `/admin/*` are `private, no-store` (correct for personalized HTML) |
| Analytics page | One RPC `get_admin_analytics` — not N+1 counts |
| Admin layout | No 13 badge queries (unlike editor) |
| N+1 | Backup profile names batched with `.in()`; perf siblings batched by `request_id` |
| Virtualization | Not needed at 10–25 row pages |
| Web Workers / service worker | No main-thread CSV parse / image work in the browser worth a worker |

---

# Prompt coverage (editor + admin only)

Status: **Problem** (this report) · **OK** · **N/A** (tech not used, or not this surface).

### Rendering & re-render (1–13)

| # | Prompt | Status |
| --- | --- | --- |
| 1 | Unnecessary re-renders | **Problem** — P1.2 (per-row dialogs); no list `memo` |
| 2 | Memoize expensive computed values | **OK** — partner sort map memoizes; remaining joins are tiny |
| 3 | Stabilize callbacks | **Problem** — P1.2 (inline `onViewOpenChange` per row) |
| 4 | Split bloated global state | **Problem** — P2.9 (sidebar context). No Zustand store |
| 5 | Virtualize long lists | **Problem** — P2.4 (170 sort slots). Tables are paginated |
| 6 | Debounce search | **Problem** — P2.10 header only. Lists OK |
| 7 | Throttle scroll/resize | **Problem** — P2.5 |
| 8 | Batch related state updates | **Problem** — P2.10 (header search). React 18 batches events |
| 9 | Observers instead of scroll math | **Problem** — P2.5 (popover position) |
| 10 | Web Workers | **N/A** on the client. Server Sharp is P2.6 |
| 11 | Break up long main-thread tasks | **N/A** — no confirmed >50ms loops in staff UI |
| 12 | Memoize list items / stable keys | **Problem** — P1.2. Keys are ids (good) |
| 13 | Defer offscreen components | **Problem** — P1.5 `forceMount` |

### Perceived loading (14–24)

| # | Prompt | Status |
| --- | --- | --- |
| 14 | Skeleton placeholders | **Problem** — P2.1 admin group. Editor group OK |
| 15 | Optimistic UI | **Problem** — P2.7 inbox archive. Toggles OK |
| 16 | Prefetch next route | **OK** — Next `Link` default prefetch; lists are dynamic so HTML still `no-store` |
| 17 | Stream HTML | **Problem** — P0.1 layout blocks children |
| 18 | Instant interaction feedback | **OK** — transitions / pending on most actions; archive feels slow (P2.7) |
| 19 | Lazy-load below the fold | **Problem** — P1.5 |
| 20 | Prioritize above-the-fold | **Problem** — P0.1 + P1.6 |
| 21 | Route-level loading | **Problem** — P2.1 admin shell. Pages otherwise OK. `admin/page.tsx` is redirect-only |
| 22 | Preconnect third parties | **N/A** — staff origin + Supabase already on the critical path |
| 23 | Reserve space / CLS | **OK** for tables/skeletons. Logo has width/height |
| 24 | Fast static shell | **Problem** — P0.1 editor, P2.1 admin |

### Images, fonts, media (25–35)

| # | Prompt | Status |
| --- | --- | --- |
| 25–28 | Modern / responsive / lazy / right-size images | **Problem** — P1.6 sidebar logo. Table logos OK |
| 29 | Image dimensions | **OK** |
| 30–31 | Subset fonts / `font-display: swap` | **OK** |
| 32 | Video | **N/A** |
| 33 | Self-host critical assets | **OK** — local fonts + logo |
| 34 | Inline tiny SVGs | **OK** — lucide in JS, not extra requests |
| 35 | CDN for static media | **OK** — hashed `/_next/static`; public PNG cache headers exist |

### JS / bundles (36–46)

| # | Prompt | Status |
| --- | --- | --- |
| 36 | Route code-split | **OK** — App Router |
| 37 | Unused deps / dead code | **OK** for this pass (no staff-only dead package found) |
| 38–39 | Tree-shake / analyze bundle | **OK** — analyzer available; not run in CI (see P2.13) |
| 40 | Defer non-critical scripts | **OK** — no blocking third-party tags in staff layouts |
| 41 | Minify | **OK** — Next production build |
| 42 | Lazy-init heavy libraries | **OK** — TipTap + Recharts dynamic. Stepper still mounts selects (P1.5) |
| 43 | Lighter libraries | **OK** — `date-fns` named imports |
| 44–45 | Hashed filenames / vendor split | **OK** — Next default |
| 46 | Render-blocking CSS | **OK** — Tailwind pipeline; no extra staff CSS files |

### Network & API (47–59)

| # | Prompt | Status |
| --- | --- | --- |
| 47 | Compress API responses | **OK** — platform gzip/brotli |
| 48 | Trim payloads | **Problem** — P1.3, P2.2 |
| 49–50 | Parallelize / kill waterfalls | **Problem** — P0.1, P2.3. Lists already parallel |
| 51 | Deduplicate identical requests | **OK** — `React.cache` / `wrapCached` on shell + details |
| 52 | Paginate large responses | **Problem** — P1.4 export, P2.4 occupants. Lists OK |
| 53 | Timeouts / retry | **N/A** as a staff-page issue (Supabase client defaults) |
| 54–55 | HTTP validators / SWR on client | **N/A** — RSC + `no-store` by design for staff HTML |
| 56 | Batch small requests | **Problem** — P0.1, P1.1 (counts) |
| 57 | Keep-alive | **OK** — fetch defaults |
| 58 | Edge reads | **N/A** — personalized CMS; must not be CDN-cached |
| 59 | Client request cache | **N/A** — no TanStack Query on these screens (correct) |

### Caching (60–68)

| # | Prompt | Status |
| --- | --- | --- |
| 60, 63, 65, 75 | Server cache for hot reads | **Problem** — P0.1 nav counts uncached across requests |
| 61 | Cache-Control | **OK** — staff `private, no-store` |
| 62 | Memoize pure compute | **OK** |
| 64 | Invalidate on writes | **OK** — admin resource tags / `revalidatePath` |
| 66 | Cache rendered HTML | **N/A** — must not cache staff HTML |
| 67 | Warm caches | **N/A** until nav counts are cached |
| 68 | Service worker | **N/A** |

### Database (69–84)

| # | Prompt | Status |
| --- | --- | --- |
| 69, 72 | Indexes / composites | **Problem** — P2.11 blogs search. Inbox/list indexes otherwise present |
| 70 | N+1 | **OK** |
| 71 | Select only needed columns | **Problem** — P1.3, P2.2 |
| 73 | Cursor pagination | **Problem** — P2.12 (acceptable at current size) |
| 74 | Profile slow queries | **Blocked** by P0.2 |
| 76 | Batch writes | **OK** — no per-row insert loops in CMS actions |
| 77 | Covering indexes | **N/A** until a slow query is proven |
| 78 | Materialize aggregations | **OK** on Analytics RPC. Nav badges still live counts (P0.1) |
| 79 | Connection pooling | **OK** — Supabase pooler / per-request server client |
| 80 | Don’t load whole tables | **Problem** — P1.4, P2.4 |
| 81–83 | Denormalize / replica / partition | **N/A** at CMS volume |
| 84 | Statement timeouts | **N/A** as a page issue |

### Backend / concurrency (85–94)

| # | Prompt | Status |
| --- | --- | --- |
| 85 | Background jobs | **Problem** — P1.4, P2.6. Backups already off the click path |
| 86 | Stream large responses | **Problem** — P1.4 |
| 87 | Async I/O | **Problem** — P2.6 Sharp on the action |
| 88 | Serverless cold start | **N/A** to this audit |
| 89 | Profile hot paths | **Blocked** by P0.2; layout counts are the obvious hot path |
| 90 | Reuse expensive resources | **OK** — module clients |
| 91 | Circuit breaker | **N/A** |
| 92 | Rate-limit | **OK** for staff (auth’d). Export is still unbounded (P1.4) |
| 93 | Cache templates | **OK** — compiled Next |
| 94 | Degrade non-critical | **Problem** — P0.1 badges are non-critical but block the shell |

### Measurement (95–100)

| # | Prompt | Status |
| --- | --- | --- |
| 95 | RUM / Web Vitals | **Problem** — P2.13 |
| 96 | Lighthouse | **Problem** — P2.13 (not run on staff routes in this pass) |
| 97 | LCP | **Problem** — P0.1 TTFB + P1.6 logo |
| 98 | CLS | **OK** for staff chrome (skeletons / reserved table) |
| 99 | INP | **Problem** — P1.2, P1.5, P2.5 |
| 100 | CI performance budget | **Problem** — P2.13 |

---

## Counts

| Bucket | Count |
| --- | --- |
| P0 problems | 2 |
| P1 problems | 6 |
| P2 problems | 13 |
| Prompts marked Problem (unique) | 40 |
| Prompts OK on this surface | 38 |
| Prompts N/A | 22 |

---

## Suggested next pass

Do **not** run the 100-prompt auto-commit loop yet. Fix in this order, then re-measure on `/dashboard/partners` and `/admin/users`:

1. P0.2 restore Performance page  
2. P0.1 defer or RPC-cache nav counts  
3. P1.2 + P1.3 shared inbox dialog + narrow columns  
4. P1.5 drop stepper `forceMount`  
5. P1.4 cap export  
6. Turn `ADMIN_PERF_TRACKING=true` in staging and capture a before/after of `dashboardLayout` vs `loadAdminListPage`
