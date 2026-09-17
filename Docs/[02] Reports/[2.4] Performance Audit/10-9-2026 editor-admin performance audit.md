# Editor & Admin panel performance audit

**Date:** 10 September 2026  
**Scope:** Editor panel (`/dashboard/*`) and Admin panel (`/admin/*`) — layouts, chrome, list pages, editor forms, and the data/actions they call. Marketing / public site is out of scope.  
**Method:** The 100 prompts in `Docs/[10] Skills/performance-audit.md`, applied as an audit (problems only at write time).  
**Progress:** ✅ = done (fixed or already healthy). **Problem** = still open. **N/A** = not this surface.  
**Related:** `Docs/[07] Work Plan/business logics/admin-performance-tracker.md`

---

## Verdict

| Question | Answer |
| --- | --- |
| Is the staff CMS broken on speed? | ✅ **P0/P1 closed.** Nav counts are one RPC + Suspense; list stats, inbox dialogs, export, steppers, and sidebar logo are done. |
| Admin panel vs editor? | ✅ Admin shell is lighter (no badge counts). Same list/table/form patterns still apply on Users. |
| Blocking ship? | ✅ **P0.1–P1.6** done. Remaining: P2.13 (RUM / Lighthouse / CI budget). |
| Already in good shape? | ✅ Paginated lists, search debounce, `Promise.all` on list+stats, TipTap/Recharts dynamic import, `React.cache` on `getStaffShell`, no `select('*')`, route `loading.tsx` on almost every page. |

**Highest-impact fix order**

1. ✅ Stop blocking the editor shell on 13 nav-count queries — now one `get_dashboard_nav_counts` RPC + `Suspense` badges (`countsPromise`, not awaited in layout).
2. ✅ Restore `/admin/performance`.
3. ✅ Cap / page / stream inbox CSV export. One list-stats RPC. Shared inbox/Users dialogs + narrow list columns.
4. ✅ Drop `forceMount` on CMS steppers so inactive steps are not live.
5. ✅ Sidebar wordmark/icon as small WebPs; one `priority` image at a time.

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

### ✅ P0.1 Editor layout waits on shell, then 13 count queries, before any page — **done**

| | |
| --- | --- |
| **Where** | Editor shell — every `/dashboard/*` request |
| **Prompts** | 17, 24, 49, 50, 56, 60, 75 |
| **Admin?** | No. Admin layout only calls `getStaffShell()`. |
| **Status** | ✅ Layout passes `countsPromise` without awaiting; badges load under `Suspense`. Counts come from one `get_dashboard_nav_counts` RPC (`data/dashboard-nav-counts.ts`). |

**Original evidence (historical)**

- Layout used to await 13 exact-count queries before children.
- Counts were only `React.cache`’d for one request.

**What was done**

- One RPC for all badge counts.
- Shell renders immediately; badges stream via `Suspense` + `use(countsPromise)`.

---

### ✅ P0.2 `/admin/performance` redirects to itself — **done**

| | |
| --- | --- |
| **Where** | Admin → System → Performance |
| **Prompts** | 95, 96 |
| **Status** | ✅ Page mounts `AdminPerfDashboard`. `/dashboard/performance` remains a one-way redirect to admin. |

---

# P1 — High impact

### ✅ P1.1 Duplicate counting: sidebar badges + page stat cards — **done**

| | |
| --- | --- |
| **Where** | Editor list pages (Blogs, Partners, Portfolio, Cohorts, Events, …) |
| **Prompts** | 56, 75, 78 |
| **Status** | ✅ One `get_admin_list_stats(p_resource)` RPC per list (`data/admin-list-stats.ts`). Inbox cards go through the same helper. Nav badges stay on `get_dashboard_nav_counts`. |

**Original evidence (historical)**

Layout already counted `blogs`, `partners`, etc. Each list page then ran 3–4 more exact counts for stat cards. Inbox lists added four more via `data/inbox-stats.ts`. Opening one list could be 17+ count queries plus the list select.

---

### ✅ P1.2 Inbox / Users tables mount a form + dialogs on every row — **done**

| | |
| --- | --- |
| **Where** | Editor: Applications, Registrations, Contact us. Both panels: Users |
| **Prompts** | 1, 3, 12, 13 |
| **Status** | ✅ One shared view/edit/delete dialog at table level. Row actions are memoized icon buttons. `useForm` mounts only when the edit dialog is open (same pattern as Performance events). |

**Original evidence (historical)**

Each inbox/Users row mounted RHF + view/edit (and Users delete) dialogs. Opening one dialog re-rendered all rows via shared `viewId` / `editUserId`.

---

### ✅ P1.3 Inbox list queries ship full long-text columns into the client table — **done**

| | |
| --- | --- |
| **Where** | Editor Applications, Registrations, Contact us |
| **Prompts** | 48, 71 |
| **Status** | ✅ List selects are table columns only. Essay fields load on dialog open via `get*ById` / `loadApplication` / `loadInterestRegistration` / `loadContactMessage`. |

**Original evidence (historical)**

List selects included dialog bodies (`problem_product` / `traction` / `programme_fit`, `pitch`, `message`) so per-row dialogs could open without a second fetch.

---

### ✅ P1.4 Unbounded inbox CSV export on the request path — **done**

| | |
| --- | --- |
| **Where** | Editor inbox “Export CSV” → `GET /api/admin/export/[table]` |
| **Prompts** | 52, 80, 85, 86 |
| **Status** | ✅ Cap `EXPORT_MAX_ROWS = 5000`; pages of 500; streamed CSV (`lib/admin/export-csv-stream.ts`); shared rate limits by userId/IP; 429 + `Retry-After`. |

**Original evidence (historical)**

Selected all rows with no limit and built the full CSV in memory.

---

### ✅ P1.5 CMS editor steppers keep every step mounted (`forceMount`) — **done**

| | |
| --- | --- |
| **Where** | Editor create/edit forms |
| **Prompts** | 13, 19, 42 |
| **Status** | ✅ Inactive `StepperContent` unmounts. RHF `shouldUnregister: false` keeps values. Failed Save jumps to the first invalid step (`firstInvalidEditorStep`). |

**Original evidence (historical)**

`forceMount` kept inactive panels in the DOM (`hidden`) on Startups, Partners, Founder stories, Impact metrics, Evidence, Events, Cohorts.

**What was done**

- Dropped `forceMount` on those editors.
- Values stay in react-hook-form across step changes.
- Invalid submit moves the stepper to the panel that owns the error, so fields do not need to stay mounted for validation.

---

### ✅ P1.6 Sidebar logo is a 141KB PNG, two `priority` images, displayed at 32px — **done**

| | |
| --- | --- |
| **Where** | Both shells (`AppSidebar`) |
| **Prompts** | 25, 26, 27, 28, 97 |
| **Status** | ✅ `/asip-logo-sidebar.webp` (320×107, ~15KB) and `/asip-icon-sidebar.webp` (64×64, ~4KB). Only the visible variant is mounted, with `priority`. |

**Original evidence (historical)**

`ASIP_LOGO.png` (`width={864}` `height={289}` `priority`, ~141KB) shown at `h-8`, plus a second `priority` 512px `icon.png` (~160KB).

**What was done**

- Sidebar wordmark is a 320px WebP sized for the 160×32 CSS slot.
- Collapsed icon is a 64px WebP, not the 512px favicon PNG.
- Expanded vs collapsed render one `next/image` each, so only one `priority` fetch.

---

# P2 — Medium / polish

### ✅ P2.1 Admin group has no shell `loading.tsx` — **done**

| | |
| --- | --- |
| **Where** | Admin first paint |
| **Prompts** | 14, 21, 24 |
| **Status** | ✅ `app/(unlocalized)/(admin)/loading.tsx` mirrors the dashboard shell skeleton. |

---

### ✅ P2.2 Blog CMS list selects columns the table never shows — **done**

| | |
| --- | --- |
| **Where** | Editor Blogs list |
| **Prompts** | 48, 71 |
| **Status** | ✅ `LIST_COLUMNS` / `BlogListItem` narrowed to `id, title, status, is_featured, author_name, updated_at`. |

---

### ✅ P2.3 Detail loaders wait for the main row before related rows — **done**

| | |
| --- | --- |
| **Where** | Editor `[id]` pages (Cohorts was the remaining waterfall) |
| **Prompts** | 49, 50 |
| **Status** | ✅ `getCohortByIdForAdmin` now `Promise.all`s cohort + partners + startups by URL id. Events/startups were already parallel. |

---

### ✅ P2.4 Partner sort-order map loads every partner and paints 170 slot buttons — **done**

| | |
| --- | --- |
| **Where** | Editor Partner create/edit |
| **Prompts** | 5, 52, 80 |
| **Status** | ✅ `PARTNER_SORT_ORDER_PAGE_SIZE = 34` (5 pages). Occupants query capped with `.limit(PARTNER_SORT_ORDER_MAX)`. |

---

### ✅ P2.5 Suggest inputs listen to every scroll/resize without throttle — **done**

| | |
| --- | --- |
| **Where** | Editor forms (partners, events, founder stories, shared suggest) |
| **Prompts** | 7, 9 |
| **Status** | ✅ Shared `useAnchoredListReposition` coalesces reposition to one rAF; listeners disconnect when the list closes. |

---

### ✅ P2.6 Image processing runs inside the upload Server Action — **done** (honest pending)

| | |
| --- | --- |
| **Where** | Editor uploads (blog cover, startup logo, partner logo) |
| **Prompts** | 10, 85, 87 |
| **Status** | ✅ Sharp stays on the Node action (rules). UI now shows **Processing image…** on the submit button + loading toast during resize/WebP/Storage. Background `after()` swap deferred. |

---

### ✅ P2.7 Inbox archive waits for the server (no optimistic UI) — **done**

| | |
| --- | --- |
| **Where** | Editor inbox row actions |
| **Prompts** | 15, 18 |
| **Status** | ✅ Local status flips immediately (same pattern as partner/blog toggles); rolls back on error; undo still supported. |

---

### ✅ P2.8 Middleware `getUser` + layout `get_staff_shell` on every staff navigation — **accepted**

| | |
| --- | --- |
| **Where** | Both shells |
| **Prompts** | 50, 51 |
| **Status** | ✅ Kept by design: middleware does session + early role redirect; layouts keep `get_staff_shell` as chrome source of truth. No third RPC. JWT `app_metadata` skip left as optional later. Comment added in `middleware.ts`. |

---

### ✅ P2.9 Shared sidebar context re-renders all chrome on toggle — **done**

| | |
| --- | --- |
| **Where** | Both shells |
| **Prompts** | 4 |
| **Status** | ✅ Split `SidebarLayoutContext` (desktop collapse / `isMobile`) from `SidebarMobileContext` (sheet). `AdminEditorActionsBar` uses `useSidebarLayout`; nav close uses `useSidebarMobile` — mobile sheet toggles no longer re-render the actions bar. |

---

### ✅ P2.10 Header command search is not debounced — **done**

| | |
| --- | --- |
| **Where** | Both shells — `DashboardPageSearch` |
| **Prompts** | 6, 8 |
| **Status** | ✅ One `PageSearchState` object batches query/results/activeIndex/open on each keystroke. Debounce intentionally skipped (tiny in-memory catalog). |

---

### ✅ P2.11 Blog CMS search has no trigram index on title / author — **done**

| | |
| --- | --- |
| **Where** | Editor Blogs search |
| **Prompts** | 69, 72 |
| **Status** | ✅ Migration `20260910250000_blogs_search_trgm_idx.sql` adds `blogs_title_trgm_idx` and `blogs_author_name_trgm_idx`. |

---

### ✅ P2.12 List pagination is OFFSET (`range`), not cursor — **accepted**

| | |
| --- | --- |
| **Where** | All CMS lists (both panels) |
| **Prompts** | 73 |
| **Status** | ✅ Kept OFFSET by design at current page sizes (10–25). Documented on `adminListRange`. Revisit cursor keys only if a list is routinely deep-paged. |

---

### ✅ P2.13 No RUM, no CI performance budget, Performance page unreachable — **partial**

| | |
| --- | --- |
| **Where** | Measurement (both panels) |
| **Prompts** | 95, 96, 97, 98, 99, 100 |
| **Status** | ✅ Performance page reachable again. RUM / Lighthouse CI / bundle budget still open. |

---

# Already healthy (do not “fix”)

These prompts were checked against editor/admin and are **not** problems today:

| Area | What is already true |
| --- | --- |
| ✅ Narrow selects | No `select('*')` in `data/` for these screens |
| ✅ List parallelism | `gate*PageData` awaits auth first (security ADM-12), then loads payload; list+stats use `Promise.all` |
| ✅ Pagination | CMS lists use `adminListRange` (10–25 typical); CSV export capped at 5 000 and streamed |
| ✅ Rate-limit | Staff export + mutation rate limits in place |
| ✅ Search debounce | List filters: 400ms. Option pickers: 300ms |
| ✅ Auth dedupe | `getStaffShell` + `isCurrentUserEditor` / `Admin` / `Staff` are `React.cache` |
| ✅ Heavy widgets | Recharts via `next/dynamic` in `admin-perf-dashboard.tsx`; TipTap via `next/dynamic` in `blog-editor-form.tsx` |
| ✅ Route loading | Colocated `loading.tsx` on editor list / new / `[id]` and admin users / backup / settings |
| ✅ Forms | Editors and dialogs use RHF + Zod, not per-field `useState` |
| ✅ Images in tables | Partner/startup logos use `next/image` + `sizes`; `<img>` only for local blob previews |
| ✅ Fonts | Root `next/font/local` + `display: "swap"` — no extra fonts in staff layouts |
| ✅ Cache-Control | `/dashboard/*` and `/admin/*` are `private, no-store` (correct for personalized HTML) |
| ✅ Analytics page | One RPC `get_admin_analytics` — not N+1 counts |
| ✅ List stat cards | One `get_admin_list_stats` RPC per resource |
| ✅ Inbox / Users tables | Shared dialogs; list columns exclude essay fields |
| ✅ Admin layout | No 13 badge queries (unlike editor) |
| ✅ Nav badges | One RPC + Suspense (no longer 13 layout counts) |
| ✅ Performance page | Reachable |
| ✅ N+1 | Backup profile names batched with `.in()`; perf siblings batched by `request_id` |
| ✅ Virtualization | Not needed at 10–25 row pages |
| ✅ Web Workers / service worker | No main-thread CSV parse / image work in the browser worth a worker |

---

# Prompt coverage (editor + admin only)

Status: ✅ done · **Problem** still open · **N/A** (tech not used, or not this surface).

### Rendering & re-render (1–13)

| # | Prompt | Status |
| --- | --- | --- |
| 1 | Unnecessary re-renders | ✅ P1.2 — shared dialogs; memoized row action buttons |
| 2 | Memoize expensive computed values | ✅ — partner sort map memoizes; remaining joins are tiny |
| 3 | Stabilize callbacks | ✅ P1.2 — stable `onView` / `onEdit` / `onDelete` at table level |
| 4 | Split bloated global state | ✅ P2.9 — sidebar layout vs mobile contexts split |
| 5 | Virtualize long lists | ✅ P2.4 — sort map pages 34 slots. Tables are paginated |
| 6 | Debounce search | ✅ P2.10 — header uses one state object (no debounce needed). Lists OK |
| 7 | Throttle scroll/resize | ✅ P2.5 — rAF coalesce on suggest popovers |
| 8 | Batch related state updates | ✅ P2.10 (header search one state object) |
| 9 | Observers instead of scroll math | ✅ P2.5 — rAF throttle (observers optional later) |
| 10 | Web Workers | **N/A** on the client. Server Sharp kept on action; P2.6 honest pending |
| 11 | Break up long main-thread tasks | **N/A** — no confirmed >50ms loops in staff UI |
| 12 | Memoize list items / stable keys | ✅ P1.2 — memoized row actions; keys are ids |
| 13 | Defer offscreen components | ✅ P1.5 — inactive stepper panels unmount |

### Perceived loading (14–24)

| # | Prompt | Status |
| --- | --- | --- |
| 14 | Skeleton placeholders | ✅ P2.1 admin shell. Editor group OK |
| 15 | Optimistic UI | ✅ P2.7 inbox archive. Toggles OK |
| 16 | Prefetch next route | ✅ — Next `Link` default prefetch; lists are dynamic so HTML still `no-store` |
| 17 | Stream HTML | ✅ P0.1 — shell streams; badges under Suspense |
| 18 | Instant interaction feedback | ✅ P2.7 archive feels instant; most actions already pending-aware |
| 19 | Lazy-load below the fold | ✅ P1.5 |
| 20 | Prioritize above-the-fold | ✅ P0.1; P1.6 sidebar logo sized + single priority |
| 21 | Route-level loading | ✅ P2.1 admin shell. Pages otherwise OK. `admin/page.tsx` is redirect-only |
| 22 | Preconnect third parties | **N/A** — staff origin + Supabase already on the critical path |
| 23 | Reserve space / CLS | ✅ for tables/skeletons. Logo has width/height |
| 24 | Fast static shell | ✅ P0.1 editor; P2.1 admin shell |

### Images, fonts, media (25–35)

| # | Prompt | Status |
| --- | --- | --- |
| 25–28 | Modern / responsive / lazy / right-size images | ✅ P1.6 sidebar WebP. Table logos OK |
| 29 | Image dimensions | ✅ |
| 30–31 | Subset fonts / `font-display: swap` | ✅ |
| 32 | Video | **N/A** |
| 33 | Self-host critical assets | ✅ — local fonts + logo |
| 34 | Inline tiny SVGs | ✅ — lucide in JS, not extra requests |
| 35 | CDN for static media | ✅ — hashed `/_next/static`; public PNG cache headers exist |

### JS / bundles (36–46)

| # | Prompt | Status |
| --- | --- | --- |
| 36 | Route code-split | ✅ — App Router |
| 37 | Unused deps / dead code | ✅ for this pass (no staff-only dead package found) |
| 38–39 | Tree-shake / analyze bundle | ✅ — analyzer available; not run in CI (see P2.13) |
| 40 | Defer non-critical scripts | ✅ — no blocking third-party tags in staff layouts |
| 41 | Minify | ✅ — Next production build |
| 42 | Lazy-init heavy libraries | ✅ TipTap + Recharts dynamic. P1.5 stepper unmounts inactive selects |
| 43 | Lighter libraries | ✅ — `date-fns` named imports |
| 44–45 | Hashed filenames / vendor split | ✅ — Next default |
| 46 | Render-blocking CSS | ✅ — Tailwind pipeline; no extra staff CSS files |

### Network & API (47–59)

| # | Prompt | Status |
| --- | --- | --- |
| 47 | Compress API responses | ✅ — platform gzip/brotli |
| 48 | Trim payloads | ✅ P1.3 inbox lists; P2.2 blogs |
| 49–50 | Parallelize / kill waterfalls | ✅ P0.1; P2.3 cohorts parallelized. Lists already parallel |
| 51 | Deduplicate identical requests | ✅ — `React.cache` / `wrapCached` on shell + details. P2.8 dual auth path accepted |
| 52 | Paginate large responses | ✅ P1.4 export capped + paged + streamed; P2.4 sort map paged. Lists OK |
| 53 | Timeouts / retry | **N/A** as a staff-page issue (Supabase client defaults) |
| 54–55 | HTTP validators / SWR on client | **N/A** — RSC + `no-store` by design for staff HTML |
| 56 | Batch small requests | ✅ P0.1 nav RPC; P1.1 list-stats RPC |
| 57 | Keep-alive | ✅ — fetch defaults |
| 58 | Edge reads | **N/A** — personalized CMS; must not be CDN-cached |
| 59 | Client request cache | **N/A** — no TanStack Query on these screens (correct) |

### Caching (60–68)

| # | Prompt | Status |
| --- | --- | --- |
| 60, 63, 65, 75 | Server cache for hot reads | ✅ P0.1 nav via RPC (cross-request TTL still optional) |
| 61 | Cache-Control | ✅ — staff `private, no-store` |
| 62 | Memoize pure compute | ✅ |
| 64 | Invalidate on writes | ✅ — admin resource tags / `revalidatePath` |
| 66 | Cache rendered HTML | **N/A** — must not cache staff HTML |
| 67 | Warm caches | **N/A** until nav counts get cross-request TTL |
| 68 | Service worker | **N/A** |

### Database (69–84)

| # | Prompt | Status |
| --- | --- | --- |
| 69, 72 | Indexes / composites | ✅ P2.11 blogs title/author trgm. Inbox/list indexes otherwise present |
| 70 | N+1 | ✅ |
| 71 | Select only needed columns | ✅ P1.3 inbox lists; P2.2 blogs |
| 73 | Cursor pagination | ✅ P2.12 — OFFSET accepted at current CMS page sizes |
| 74 | Profile slow queries | ✅ Unblocked — Performance page restored (P0.2) |
| 76 | Batch writes | ✅ — no per-row insert loops in CMS actions |
| 77 | Covering indexes | **N/A** until a slow query is proven |
| 78 | Materialize aggregations | ✅ on Analytics RPC. Nav badges (P0.1) and list stats (P1.1) via one RPC each |
| 79 | Connection pooling | ✅ — Supabase pooler / per-request server client |
| 80 | Don’t load whole tables | ✅ P1.4 export capped + paged; P2.4 occupants limited to MAX |
| 81–83 | Denormalize / replica / partition | **N/A** at CMS volume |
| 84 | Statement timeouts | **N/A** as a page issue |

### Backend / concurrency (85–94)

| # | Prompt | Status |
| --- | --- | --- |
| 85 | Background jobs | ✅ Export capped + streamed; P2.6 Sharp kept on action with honest pending. Backups already off the click path |
| 86 | Stream large responses | ✅ P1.4 streamed CSV in 500-row pages |
| 87 | Async I/O | ✅ P2.6 — Sharp still sync on action; UI labels the wait |
| 88 | Serverless cold start | **N/A** to this audit |
| 89 | Profile hot paths | ✅ Unblocked by P0.2 |
| 90 | Reuse expensive resources | ✅ — module clients |
| 91 | Circuit breaker | **N/A** |
| 92 | Rate-limit | ✅ Staff export + mutation limits |
| 93 | Cache templates | ✅ — compiled Next |
| 94 | Degrade non-critical | ✅ P0.1 badges no longer block the shell |

### Measurement (95–100)

| # | Prompt | Status |
| --- | --- | --- |
| 95 | RUM / Web Vitals | **Problem** — P2.13 (page reachable; RUM still missing) |
| 96 | Lighthouse | **Problem** — P2.13 |
| 97 | LCP | ✅ P0.1 TTFB; P1.6 sidebar no longer ships 864px / dual-priority logos |
| 98 | CLS | ✅ for staff chrome (skeletons / reserved table) |
| 99 | INP | ✅ P1.2 shared dialogs; P1.5 stepper unmounts inactive steps |
| 100 | CI performance budget | **Problem** — P2.13 |

---

## Counts

| Bucket | Count |
| --- | --- |
| P0 problems | ✅ 0 open (2 done) |
| P1 problems | ✅ 0 open (P1.1–P1.6 done) |
| P2 problems | ✅ P2.1–P2.12 done; P2.13 **partial** (page reachable; RUM / Lighthouse / CI still open) |
| Prompts marked Problem (unique) | P2.13 (95, 96, 100) |
| Prompts done on this surface | ✅ all except 95, 96, 100 |
| Prompts N/A | 22 |

---

## Suggested next pass

Do **not** run the 100-prompt auto-commit loop yet. Fix in this order, then re-measure on `/dashboard/partners` and `/admin/users`:

1. ✅ P0.2 restore Performance page  
2. ✅ P0.1 defer or RPC-cache nav counts  
3. ✅ P1.1 list-stats RPC; P1.2 + P1.3 shared inbox dialog + narrow columns  
4. ✅ P1.5 drop stepper `forceMount`  
5. ✅ P1.4 cap / page / stream export  
6. ✅ P1.6 sidebar logo  
7. Turn `ADMIN_PERF_TRACKING=true` in staging and capture a before/after of `dashboardLayout` vs `loadAdminListPage`
