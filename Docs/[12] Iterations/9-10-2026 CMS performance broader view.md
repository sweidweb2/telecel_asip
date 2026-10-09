# CMS performance — broader view

**Date:** 9 October 2026  
**Scope:** Editor panel (`/dashboard/*`) and Admin panel (`/admin/*`). Marketing pages are in scope only where a CMS write busts their cache.  
**Question:** Are there potential performance problems when you look across the CMS, not one screen at a time?  
**Answer:** **Yes.** No single screen is broken. The cost that remains is paid on every editor navigation, and it repeats work the last audit already collapsed into RPCs.  
**Method:** Read the current shell, list loaders, count RPCs, search indexes, and write-path cache busts. The 10 September audit (`Docs/[02] Reports/[2.4] Performance Audit/10-9-2026 editor-admin performance audit.md`) is treated as done; this report does not reopen closed items.

This is an assessment. No code was changed.

---

## How to read a finding

Each finding is one block. Severity is about the CMS as it is used, not about a theoretical maximum.

| Severity | Meaning |
| --- | --- |
| **Critical** | The panel stalls or times out on a normal click today. |
| **High** | Extra database work on every editor navigation, or on the home page. Grows with inbox and newsletter volume. |
| **Medium** | Hurts one flow, or hurts the public site after a save. Fine at today’s row counts. |
| **Low** | Real, but small at current page sizes, or only when a flag is on. |

**Critical count: 0.** The panel is usable. The High items are the ones to fix before intake tables get large.

---

## Verdict

| Question | Answer |
| --- | --- |
| Is the CMS slow because of one page? | No. Lists are paginated, selects are narrow, list + stats run in parallel, heavy editors (TipTap, charts) load on demand. |
| Is there a cross-screen cost? | ✅ Findings 1 and 2 are cached. Remaining cost is auth round trips and the items below. |
| Does the admin panel pay the same cost? | No. `/admin` does not call `get_dashboard_nav_counts`. ✅ Middleware no longer adds a shell RPC when `app_role` is on the user (finding 3). The layout shell call remains. |
| What to fix first? | ✅ Findings 1–9 are done. Leave tracking off outside a short staging capture. |

---

## ✅ Finding 1 — Nav badges recount 13 tables on every editor click, and the cache tag is unused — **done**

| | |
| --- | --- |
| **Severity** | **High** |
| **Status** | ✅ `getDashboardNavCounts` uses `unstable_cache` for 60s on `DASHBOARD_NAV_COUNTS_CACHE_TAG`. Writes already bust that tag. The session token is not part of the cache key. |
| **Where** | Every `/dashboard/*` request. Not `/admin`. |
| **What runs** | `get_dashboard_nav_counts` — 13 `COUNT(*)` scans inside one function (inbox, newsletter, blogs, startups, partners, stories, cohorts, events, evidence, metrics, profiles). |

**Evidence**

- `supabase/migrations/20260910230000_get_dashboard_nav_counts.sql` — one `SELECT count(*)` per table, in order.
- `data/dashboard-nav-counts.ts` — wrapped in `React.cache` only. That cache lives for one request.
- `constants/dashboard-nav-counts.ts` — `DASHBOARD_NAV_COUNTS_CACHE_TAG`.
- `lib/admin/run-admin-mutation.ts` — `refreshAdminResource` calls `revalidateTag` on that tag after CMS writes.

**Why it hurts**

The tag is invalidated on write, but nothing stores the RPC result under that tag. `unstable_cache` is used for public reads (blogs, startups, partners). It is not used for nav counts. So:

- Every editor navigation runs the 13 counts again, including pages that do not show those tables.
- Every save pays a cache bust that has no reader.
- The unbounded tables (applications, registrations, contact messages, newsletter subscribers) are part of the badge query, so they sit on the hot path for Blogs, Partners, and Settings too.

One RPC was the right shape. The missing piece is a short-lived cached result, busted by the tag that already exists.

**What to do**

Cache `getDashboardNavCounts` with `unstable_cache` and `DASHBOARD_NAV_COUNTS_CACHE_TAG` (tens of seconds is enough; writes already bust the tag). Keep the single RPC. Do not split it back into 13 client queries.

---

## ✅ Finding 2 — Home and list pages count the same tables again — **done**

| | |
| --- | --- |
| **Severity** | **High** |
| **Status** | ✅ `get_admin_analytics` is cached 60s on `dashboard-nav-counts`. `get_admin_list_stats` is cached 60s per resource on that resource’s tag (`blogs`, `applications`, and the rest). |
| **Where** | Editor home (`/dashboard`), Analytics, and every CMS list that shows stat cards. |
| **What runs** | A second aggregate RPC on top of finding 1, against the same tables. |

**Evidence**

- Home: `app/(unlocalized)/(dashboard)/dashboard/page.tsx` awaits `getAdminAnalytics()` after the shell has already started `getDashboardNavCounts()`.
- `get_admin_analytics` (`supabase/migrations/20260910180000_editor_admin_staff_split.sql`) scans applications, registrations, and contact messages, then runs about 14 more content counts (blogs, startups, partners, cohorts, events, stories, metrics).
- List pages: `fetchAdminListStats` → `get_admin_list_stats` (`supabase/migrations/20260910250100_get_admin_list_stats.sql`) scans the open resource again for total / published / draft / featured (or the inbox equivalent).
- Example: opening Blogs runs the 13 nav counts **and** a full blogs scan for the four stat cards **and** the page query.

**Why it hurts**

The queries are parallel, so this is not a waterfall. It is duplicate scans. Home is the heaviest view: nav counts plus the analytics RPC, and the screen only displays three unread numbers plus a launcher. List stat cards repeat a total the nav RPC already computed, then add the filtered splits.

At tens or hundreds of rows this is cheap. Applications, registrations, contact messages, and newsletter subscribers are the tables that grow without an editor deleting them. Those scans run on every home visit and on every matching list.

**What to do**

- Home: read unread totals from the cached nav payload (add unread to that RPC if the badge today is a raw total), or cache `get_admin_analytics` on the same tag. Do not run both uncached on one view.
- List cards: keep `get_admin_list_stats` (the filtered splits are useful) but cache it per resource with the resource tag (`blogs`, and so on). Writes already call `revalidateTag` for those tags.

---

## ✅ Finding 3 — Every staff click pays two auth round trips before the page starts, then a third in the layout — **done**

| | |
| --- | --- |
| **Severity** | **Medium** |
| **Status** | ✅ Middleware reads `app_metadata.app_role` from the `getUser()` result and skips `get_staff_shell` when that claim is `admin`, `editor`, or `viewer`. Login and intake skip the role lookup. The layout RPC stays. A missing claim still falls back to `get_staff_shell`. |
| **Where** | Both shells. Every `/dashboard/*` and `/admin/*` navigation. |
| **What runs** | Middleware: `auth.getUser()`, then `get_staff_shell`. Layout: `get_staff_shell` again. |

**Evidence**

- `middleware.ts` — `refreshSupabaseSession` awaits `getUser()`, then `rpc("get_staff_shell")`. The comment records that middleware and React Server Components do not share `React.cache`.
- `lib/admin/get-staff-shell.ts` — layout and `isCurrentUserEditor` / `isCurrentUserAdmin` share one RPC **inside** the render. They cannot see the middleware call.
- Editor layout then still starts finding 1. Admin layout stops after the shell.

**Why it hurts**

This is the latency floor. The two middleware calls are sequential, and they finish before the page loader starts. The layout call is a third trip to Supabase for the same row. Role checks inside the count RPCs (`is_editor()`) add a fourth lookup on editor pages.

The September audit kept this on purpose: middleware redirects the wrong role before HTML is sent, and the layout remains the source of truth for the name and email in the chrome. That split is sound. It still costs two network round trips on every click, which dominates the actual page query while tables are small.

**What to do**

Leave the layout RPC. The optional cut is a role flag in the JWT (`app_metadata`) so middleware can redirect without `get_staff_shell`. Do that only if measured TTFB on `/dashboard/blogs` is still dominated by middleware after findings 1 and 2 are cached.

---

## ✅ Finding 4 — A few search fields have no trigram index, and some searches paste the raw query into the filter — **done**

| | |
| --- | --- |
| **Severity** | **Medium** |
| **Status** | ✅ Migration `20261009230700_cms_search_trgm_idx.sql` adds trigram indexes on newsletter `email` and `source_page`, `cohorts.public_label`, and `blogs.slug`. Blogs, applications, registrations, contact, newsletter, and cohort search now escape the query. Impact `value` / `geography` and `admin_perf_events.name` stay unindexed, as scoped. |
| **Where** | Newsletter search (grows). Also blogs slug, cohort label, impact value/geography, performance-event name. |
| **What runs** | `ILIKE '%term%'` (leading wildcard). |

**Evidence**

Trigram indexes already exist for profiles, blogs title/author, startups, partners, events, evidence primary source, impact claim label, and the three inbox tables.

These searched columns do not:

| Search | Columns | Index |
| --- | --- | --- |
| Newsletter | `email`, `source_page` | none |
| Cohorts | `public_label` | none |
| Blogs | `slug` (title and author are indexed) | none on slug |
| Impact metrics | `value`, `geography` (claim label is indexed) | none on those two |
| Performance events | `name` | none |

Raw text is interpolated into `.or()` / `.ilike()` in `data/blogs.ts`, `data/applications.ts`, `data/interest-registrations.ts`, `data/contact-messages.ts`, `data/newsletter-subscribers.ts`, and `data/cohorts.ts`. Other lists use `escapeIlikePattern`. A comma or `%` in the box changes the PostgREST filter. That is a correctness bug; it also means the planner cannot rely on a single trigram predicate.

**Why it hurts**

Inbox search is in good shape. Newsletter is the list that grows on its own and has neither a trigram index nor an escaped pattern. Cohort and blog-slug search stay cheap until those tables are large; they are the same pattern, so they belong in one migration rather than a later surprise.

**What to do**

One migration: trigram indexes on `newsletter_subscribers.email`, `newsletter_subscribers.source_page`, `cohorts.public_label`, `blogs.slug`. Escape every CMS search through `escapeIlikePattern` before it is concatenated. Impact `value` / `geography` and `admin_perf_events.name` can wait until those screens are actually searched hard.

---

## ✅ Finding 5 — Some saves bust a large public cache, not just the edited page — **done**

| | |
| --- | --- |
| **Severity** | **Medium** |
| **Status** | ✅ Settings no longer call `revalidatePath("/en", "layout")` or `/fr`. They bust home, programme, apply, register-interest, login, signup, and the sitemap. Impact saves bust home only. Founder stories bust `/founders`, `/founders/[slug]`, and `/impact`, not the founders layout. Data tags are unchanged. |
| **Where** | Settings save. Also impact-metric saves (home) and founder-story saves (founders layout). |
| **What runs** | `revalidatePath` / `revalidateTag` after a successful write. |

**Evidence**

- `actions/settings.ts` — `revalidatePath("/en", "layout")` and `revalidatePath("/fr", "layout")`, plus home, programme, insights, apply, and register-interest in both locales.
- `actions/impact-metrics.ts` — revalidates `/en` and `/fr` as well as `/impact`.
- `actions/founder-stories.ts` — revalidates the founders **layout** in both locales, plus impact.
- Blog, partner, and startup saves revalidate the specific public paths. That is the narrower pattern.

**Why it hurts**

Staff HTML is `private, no-store`, so this does not slow the CMS click itself. It drops the marketing cache. A settings toggle (applications open, newsletter on) forces the next visitor to rebuild every page under `/en` and `/fr`, not only the pages that read the setting.

Settings changes are rare. Founder-story and impact saves are not. Those two are the ones that will cold-start public pages during normal editing.

**What to do**

Keep `revalidateTag` for the data cache. Narrow `revalidatePath` to the routes that render that data. Settings should bust the pages that read site settings, not both locale layouts. Founder stories should bust the founders pages, not the layout wrapper.

---

## ✅ Finding 6 — Turning performance tracking on writes a row per measured span, and the dashboard aggregates in Node — **done**

| | |
| --- | --- |
| **Severity** | **Medium** (only while `ADMIN_PERF_TRACKING=true`; otherwise idle) |
| **Status** | ✅ Charts call `get_admin_perf_analytics` (counts and p95 by name, plus hourly buckets) instead of folding 1,000 rows in Node. The event list uses `count: "estimated"`. The flag stays off unless `ADMIN_PERF_TRACKING=true`. |
| **Where** | Every traced layout, page, and mutation. Admin → Performance. |
| **What runs** | Fire-and-forget insert into `admin_perf_events`. The Performance page then loads up to 1,000 rows and counts them in JavaScript. |

**Evidence**

- `lib/admin/perf/config.ts` — on only when `ADMIN_PERF_TRACKING=true`.
- `lib/admin/perf/trace.ts` + `persist.ts` — each `traceAsync` inserts one row. The insert is not awaited, but it still opens a Supabase call.
- A normal list view traces the layout, the page gate, and the data read. That is several inserts per click.
- `data/admin-perf-events.ts` — list query uses `count: "exact"` (the other CMS lists use `"estimated"`). Analytics pulls `ADMIN_PERF_ANALYTICS_LIMIT` (1,000) rows and folds them in `buildAnalytics`.

**Why it hurts**

The flag is off by default, so production does not pay this today. If it is left on to “watch speed,” the watcher becomes extra writes on the path being measured, and the Performance page does the aggregation the database should do.

**What to do**

Keep the flag off outside a short staging capture. If the page stays, aggregate in SQL (counts and percentiles by name) and keep the list on `"estimated"` or a capped exact count. Do not raise the 1,000-row pull.

---

## ✅ Finding 7 — Image saves still resize inside the request — **done**

| | |
| --- | --- |
| **Severity** | **Low** |
| **Status** | ✅ Left as specified. `processImageBuffer` still runs inside the Server Action before Storage. Moving it to `after()` would show the old image until the new object is ready. |
| **Where** | Blog cover, author avatar, startup logo, partner logo, and the other admin image uploads. |
| **What runs** | `processImageBuffer` (Sharp) inside the Server Action, then Storage upload. |

**Evidence**

- `lib/media/upload-versioned-public-image.ts` awaits `processImageBuffer` before the upload returns.
- The editor already shows “Processing image…” for that wait. The September audit left Sharp on the action on purpose (Sharp is not Edge-safe; the rule requires processing before Storage).

**Why it hurts**

A large original holds the save button until resize and upload finish. It does not slow lists or navigation. Moving it to `after()` would show the old image until the new object is ready, which fights the versioned-path rule.

**What to do**

Leave it. Revisit only if editors routinely upload multi-megabyte originals and the wait is the complaint.

---

## ✅ Finding 8 — List paging is OFFSET, and two small lists still use an exact count — **done**

| | |
| --- | --- |
| **Severity** | **Low** |
| **Status** | ✅ Left as specified. CMS lists stay on offset pages of 10–25 rows. Backups keep `count: "exact"` while that table stays small. |
| **Where** | All CMS lists (`adminListRange`). Exact count remains on backups. |
| **What runs** | `range(from, to)` with a page size of about 10–25. |

**Evidence**

- `lib/admin/admin-list-query.ts` documents OFFSET on purpose.
- CMS list loaders use `count: "estimated"`, which avoids a second exact scan on every page.
- `data/backups.ts` still uses `count: "exact"`. Performance events use `"estimated"` (finding 6).

**Why it hurts**

OFFSET gets slower as someone pages deep. Editors do not do that on 10–25 row pages. Exact count on backups is a small table.

**What to do**

Do not convert CMS lists to cursors unless a list is routinely opened past the first pages. Switch backups to `"estimated"` only if that table grows.

---

## ✅ Finding 9 — Nothing records real editor latency in production — **done**

| | |
| --- | --- |
| **Severity** | **Low** |
| **Status** | ✅ Timed once on 9 Oct 2026 against local `next dev` (`localhost:3000`), signed in as an editor. One warmup request per route was discarded. The next three full responses: `/dashboard` 1021 ms, 918 ms, 928 ms; `/dashboard/blogs` 1096 ms, 1062 ms, 1015 ms. No Lighthouse pass and no CI bundle budget. |
| **Where** | Both panels. |
| **What is missing** | Real-user timings, a Lighthouse pass on staff routes, a bundle budget in CI. |

**Evidence**

The September audit left this open (its P2.13). The in-app Performance page is not a substitute: it is off unless the flag in finding 6 is on, and it measures server spans, not click latency in the browser.

**Why it hurts**

Findings 1–3 are network round trips. They will not show up as a slow SQL statement in a table of 200 blogs. Without a timing on `/dashboard` and `/dashboard/blogs`, the cache in finding 1 can be skipped and nobody will see the regression.

**What to do**

After findings 1 and 2, time those two routes once (server timing or the Performance page in staging with the flag on for a single session). A standing CI budget can wait.

---

## Already in good shape

Do not reopen these. They were checked again and still hold.

| Area | What is true now |
| --- | --- |
| List shape | Paginated, narrow columns, no `select('*')`. Long inbox text loads when the dialog opens. |
| List parallelism | Role check, then `Promise.all` of the page query and `get_admin_list_stats`. |
| Counts collapsed | Nav badges, list stat cards, and the analytics snapshot are each one RPC, cached on the tag the matching write already busts. |
| Editors | Inactive stepper steps unmount. TipTap and Recharts load with `next/dynamic`. |
| Shell | Admin does not fetch badge counts. Editor badges stream under Suspense and do not block the layout. |
| Export | CSV is capped, paged, and streamed. |
| Images in the shell | Sidebar mark is a small WebP. |
| Staff HTML cache | `private, no-store` is correct. Do not CDN-cache `/dashboard` or `/admin`. |
| Public reads | Published blogs, startups, partners, cohorts, and settings use `unstable_cache` plus tags. |

---

## Fix order

1. ✅ **Finding 1** — cache `get_dashboard_nav_counts` on `DASHBOARD_NAV_COUNTS_CACHE_TAG`.
2. ✅ **Finding 2** — cache list stats on the resource tag; cache home analytics on the nav-count tag.
3. ✅ **Finding 4** — trigram indexes for newsletter, cohort label, and blog slug; escape every CMS search string.
4. ✅ **Finding 5** — narrow settings and founder-story / impact `revalidatePath` so a save does not drop the whole locale.
5. ✅ **Finding 3** — middleware role redirect uses `app_metadata.app_role` instead of a second shell RPC.
6. ✅ **Finding 6** — aggregate Performance charts in SQL; list count is `"estimated"`. Leave the tracking flag off outside a short staging capture.
7. ✅ **Finding 7** — keep Sharp on the image save. Revisit only if multi-megabyte originals make the wait the complaint.
8. ✅ **Finding 8** — keep offset paging. Switch backups to `"estimated"` only if that table grows.
9. ✅ **Finding 9** — one local timing of `/dashboard` and `/dashboard/blogs`. A standing CI budget can wait. |

---

## Counts

| Severity | Open |
| --- | --- |
| Critical | 0 |
| High | 0 open. ✅ Findings 1 and 2 done. |
| Medium | 0 open. ✅ Findings 3–6 done. |
| Low | 0 open. ✅ Findings 7 and 8 left as specified. ✅ Finding 9 timed once. |
