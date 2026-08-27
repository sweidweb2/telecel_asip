# Full project scan report — ASIP / Telecel

**Date:** 27 August 2026  
**Scope:** Entire Next.js + Supabase codebase (frontend, backend, DB, auth, config, deps, tests, structure)  
**Method:** Read-only audit. Flows traced UI → actions/data → Supabase → response → UI. No production runtime verification. **No code was changed.**  
**Related:** CDN readiness — `Docs/[02] Reports/[2.1] CDN/27-8-2026 CDN readiness report - v2.md`

---

## 1. Executive Summary

**Overall health:** Solid mid-to-late Phase 1. Core CMS (blogs, startups, users, contact, interest registrations) and bilingual marketing site work with Zod dual validation, `authorizeAdmin` + RLS, versioned Storage/CDN foundations, and meaningful Playwright coverage for auth/RLS.

**Working areas:** Auth login/signup/callback, users CRUD (admin-locked), blogs + public insights, startups + public portfolio, contact + apply forms (Turnstile + service role), SEO (metadata/sitemap/robots/JSON-LD), CDN/media pipeline, Option A marketing caching, designed error screens.

**Broken / incomplete:** Four dashboard destinations are empty stubs still linked in nav; dashboard is session-gated not admin-gated (any signed-up viewer reaches admin chrome); create-user allows literal default password `"password"`; analytics / backups from RFQ are missing; registrations lack E2E.

**Biggest risks**

1. Non-admin access to the full admin shell (surface + privilege UX mismatch).  
2. Weak default CMS password on user create.  
3. Non-transactional blog featured clear → can leave zero featured posts.  
4. Storage delete before DB commit on media/entity delete.  
5. Non-transactional blog featured clear and storage-before-DB deletes (data integrity).

**Verdict:** Shippable CMS core with known product/security gaps — not production-ready until P0/P1 below are addressed.

---

## Feature map (quick)

| Area | Routes / modules | Status |
|------|------------------|--------|
| Marketing (en/fr) | `/`, about, programme, portfolio, insights, apply, contact, faq, terms, privacy | **Working** |
| Auth | login, signup, register, callback | **Working** (open signup → viewer) |
| Users CMS | `/dashboard/users` | **Working** (admin role only in UI) |
| Blogs CMS + Insights | `/dashboard/blogs`, public insights | **Working** (slug-rename cache gap) |
| Startups CMS + Portfolio | `/dashboard/portfolio`, public portfolio | **Partial** vs RFQ/[1.5] (no gallery/featured/cohort) |
| Contact | public form + `/dashboard/contact-us` | **Working** (DB inbox only; no email) |
| Apply / registrations | public apply + `/dashboard/registrations` | **Working** minus E2E |
| Analytics / Backup / Settings / Home | dashboard stubs | **Empty** |
| CookieYes / CMP | — | **Dropped** (task removed; privacy copy updated) |
| CDN / media | blogs + startups + avatars | **Solid** for current surface |

---

## 2. Critical Issues

No confirmed Critical of the form “remote RCE / anon write to CMS / service-role in client bundle.” Highest confirmed findings are **High**; two are elevated to **Critical** if public signup remains enabled in production.

| ID | Severity | Summary |
|----|----------|---------|
| C1 | Critical* | `createUser` empty password → `"password"` |
| C2 | Critical* | Dashboard auth-only, not admin-only; signup reaches admin shell |
| H3 | High | Four dashboard routes empty but nav-linked |
| H4 | High | Blog featured clear + write not transactional |
| H5 | High | User Auth Admin update then profile update not atomic |
| H6 | High | Storage `remove` before DB update/delete |

\*Critical under the assumption of production/shared staging with open signup or real admin accounts created via CMS.

---

## 3. Security Audit

### C1 / H2 — Default password `"password"`

| | |
|---|---|
| **Severity** | Critical (prod) / High |
| **Location** | `validations/users.ts` `USER_DEFAULT_PASSWORD`, `createPasswordSchema` (~L15, L38–42); `actions/users.ts` `createUser` |
| **Problem** | Empty password transforms to `"password"` and is accepted via `z.literal`, bypassing strength rules. Role locked to `admin`. |
| **Impact** | New CMS admins with a trivial, known password. |
| **Recommended fix** | Remove default; require strong password always; prefer generated one-time password + force reset. |
| **Dependencies** | Users create dialog UX; E2E `users.spec.ts`. |

### C2 / H1 — Dashboard session-gated, not admin-gated

| | |
|---|---|
| **Severity** | Critical (if public signup stays) / High |
| **Location** | `middleware.ts` `isProtectedPath`; `app/(dashboard)/layout.tsx` (no `is_admin`); `actions/auth.ts` `signUp` |
| **Problem** | Middleware requires a session for `/dashboard/*`. Layout never calls `is_admin`. Signup creates `viewer` via `handle_new_user`, then user can open full admin chrome. Data pages redirect on `forbidden`, but `/dashboard`, analytics, backup, settings stay reachable. |
| **Impact** | Privilege UX mismatch; wider surface for future dashboard features; info disclosure of admin IA. |
| **Recommended fix** | Gate dashboard layout (or middleware) with `is_admin()`; redirect non-admins to marketing home; optionally invite-only signup. |
| **Dependencies** | Product: invite-only CMS vs open registration; auth E2E. |

### M1 — `profiles.role` default `'admin'`

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `supabase/migrations/20260822183000_create_profiles.sql` |
| **Problem** | Column default remains `admin`; trigger defaults signup to `viewer`, but omitted-role inserts escalate. |
| **Impact** | Accidental privilege escalation if a profile path omits role. |
| **Recommended fix** | New migration: `alter column role set default 'viewer'`. |
| **Dependencies** | Append-only migration rule; update `Docs` schema notes. |

### M2 — In-memory rate limit

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `lib/rate-limit.ts`; contact + interest actions |
| **Problem** | Process-local `Map`; not shared across serverless instances. |
| **Impact** | Easy bypass at scale; Turnstile remains primary. |
| **Recommended fix** | Redis/Upstash or edge WAF when abuse appears. |

### M3 — Hardcoded E2E/seed credentials

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `supabase/seed.sql`; `e2e/*.spec.ts` fallbacks |
| **Problem** | Real-looking credentials in repo. |
| **Impact** | If reused on shared staging/prod, known admin password. |
| **Recommended fix** | Env-only; fail closed when missing; rotate if ever used outside local. |

### M4 — `createAdminClient` missing `server-only`

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `lib/supabase/admin.ts` |
| **Problem** | Service-role client; nothing blocks accidental client import. Non-null env assertions. |
| **Impact** | Bundle leak of `SUPABASE_SERVICE_ROLE_KEY` if mis-imported; opaque failures if env missing. |
| **Recommended fix** | `import "server-only"`; explicit env validation. |

### M5 — No app-level CSP / frame / HSTS in `next.config.ts`

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `next.config.ts` `headers()` (cache split only) |
| **Problem** | Security headers not set in app config. |
| **Impact** | Weaker XSS/clickjacking defense (DOMPurify still on blogs). |
| **Recommended fix** | Add headers in Next or confirm host already injects them. |
| **Needs verification** | Host (Vercel/Cloudflare) may already set these. |

### CookieYes / CMP — dropped (27 Aug 2026)

CookieYes was never shipped in `app/`. Task doc `[1.6]` deleted; privacy copy no longer claims cookie-preference controls. No CMP planned.

### Low security

- Media upload/remove IDs not Zod-validated (`actions/blogs.ts`, `actions/startups.ts`).  
- `actions/auth.ts` `mapAuthError` `.otherwise` can return raw Supabase messages.  
- `updateUser` does not sync `app_metadata.app_role` (OK today because `is_admin()` uses profiles).  
- `get_user_stats` executable by any authenticated user (RLS skews results for non-admins).  
- No app rate limit on `signIn` (**Needs verification:** Supabase Auth brute-force / CAPTCHA settings).

### Security — do not change

- Option A marketing (no session peek; middleware refresh scoped to dashboard + auth).  
- `authorizeAdmin` + RLS dual gate on mutations.  
- Public forms: no anon INSERT; service role after Zod + Turnstile + rate limit.  
- `handle_new_user` role from `app_metadata` only; profile role self-promotion trigger.  
- Storage admin-write / public-read + versioned paths.  
- Blog DOMPurify sanitize.  
- Open-redirect hardening on auth `next` / callback.  
- `.env.example` placeholders; env files gitignored.

---

## 4. Functional / Business Logic Issues

### H4 — Featured blog clear not transactional

| | |
|---|---|
| **Severity** | High |
| **Location** | `actions/blogs.ts` `clearOtherFeatured` + `createBlog` / `updateBlog` |
| **Problem** | Clears other featured, then insert/update as separate statements. Second failure → zero featured. |
| **Impact** | Marketing insights hero blank; concurrent races. |
| **Recommended fix** | Transactional RPC (mirror startups `create_startup_with_details` pattern). |
| **Dependencies** | Partial unique index `blogs_one_featured_uidx`. |

### H5 — User update split Auth ↔ profile

| | |
|---|---|
| **Severity** | High |
| **Location** | `actions/users.ts` `updateUser` |
| **Problem** | Auth Admin update then profiles update; profile failure leaves split identity. |
| **Impact** | Login email ≠ CMS list email. |
| **Recommended fix** | Compensating rollback or sync trigger; sync `app_metadata` when roles unlock. |

### Blog slug rename — stale public cache

| | |
|---|---|
| **Severity** | High |
| **Location** | `actions/blogs.ts` `updateBlog` (selects `id, published_at, status`; `refreshBlogPaths(data.slug)` only) |
| **Problem** | Previous slug path not revalidated on rename (startups already revalidate previous slug). |
| **Impact** | Stale `/en|/fr/insights/{oldSlug}` until tag TTL / HTML `s-maxage`. |
| **Recommended fix** | Select old slug; revalidate previous path like startups. |

### Role product surface half-built

| | |
|---|---|
| **Severity** | Medium |
| **Location** | `USER_ROLES` vs `USER_FORM_ROLE = "admin"` |
| **Problem** | Filters imply editor/viewer; UI can only create admins. |
| **Impact** | Misleading admin UX; RFQ “role-based CMS” unmet. |
| **Recommended fix** | Unlock roles + page-level permissions, or remove unused role UI. |

### Public startup details unused

| | |
|---|---|
| **Severity** | Low / product |
| **Location** | `data/startups.ts`; public portfolio detail UI |
| **Problem** | Admin loads `startup_details`; public page uses core columns only. |
| **Impact** | Product gap only if details were meant for marketing. |

### Forms → DB only (no notify)

| | |
|---|---|
| **Severity** | Medium |
| **Location** | contact + interest registration actions |
| **Problem** | No email/webhook to Telecel on submit. |
| **Impact** | Ops may miss leads unless they watch the CMS. |

### Startups vs Docs/[1.5] / RFQ

| | |
|---|---|
| **Severity** | Medium |
| **Problem** | No gallery, `is_featured`, cohort filters, `toggleFeatured` as specified; description plain text (no HTML sanitize needed yet). |
| **Impact** | Product mismatch vs task doc. |
| **Recommended fix** | Explicit scope decision: document deferred or implement with migrations. |

---

## 5. Frontend Issues

| Severity | Location | Problem | Impact | Fix |
|----------|----------|---------|--------|-----|
| High | `dashboard/{page,analytics,settings,backup}/page.tsx` + `constants/dashboard-nav.ts` | Empty stubs still linked | Dead admin UX; RFQ incomplete | Ship content or hide nav |
| Medium | Dashboard title helper | Nested routes show title “Dashboard” | Confusing chrome | Longest-prefix match |
| Medium | Sidebar / header | Hardcoded “Admin” / “AD” | Misleading identity | Pass real profile |
| Medium | Apply vs Contact forms | Duplicated Turnstile lifecycle | Drift risk | Shared hook/component |
| Medium | `blogs/new`, `portfolio/new` pages | Direct Supabase + `is_admin` in `app/` | Architecture violation | Use `data/auth` `isCurrentUserAdmin` |
| Low | Admin list pagination ×3 | Near-identical | Maintainability | Shared component |
| Low | Some locale `loading.tsx` | Plain Skeleton vs `RouteSkeleton` | Inconsistent loading UX | Align when convenient |

**Working (preserve):** Marketing responsive nav/sheet; `error.tsx` / `global-error` / `not-found` via shared screens; empty states on CMS lists and public filters; RHF + Zod forms; no Radix/Zustand/TanStack Query for initial load; Option A marketing chrome (Apply in nav, Login in footer).

---

## 6. Backend / API Issues

| Severity | Location | Problem | Impact | Fix |
|----------|----------|---------|--------|-----|
| High | blogs/startups delete & remove image | Storage remove before DB | Orphan DB URL or lost file | DB first, then storage; log cleanup failures |
| High | `updateBlog` | Old slug not revalidated | Stale public pages | Mirror startups previous-slug path |
| Medium | `actions/auth.ts` → `components/auth/auth-labels` | Wrong dependency direction | Layering smell | Move messages to `constants/` / `lib/` |
| Medium | blogs/startups actions | Uneven `ts-pattern` vs project rule | Inconsistent error branching | Align with users/auth |
| Low | `signOut` | Ignores Auth errors | Silent failure | Log then redirect |
| Low | Media action IDs | Not Zod-validated | Bad input → opaque errors | Add Zod schemas |

**CRUD matrix**

| Entity | Create | Read (list/detail) | Update | Delete | Notes |
|--------|--------|--------------------|--------|--------|-------|
| Users | Yes | List + stats | Yes | Yes | Admin-only role in UI |
| Blogs | Yes | Admin + public | Yes | Yes | Featured race; slug cache |
| Startups | Yes | Admin + public | Yes | Yes | RPC transactional writes |
| Contact | Public submit + admin | List | Yes | Yes | No email |
| Registrations | Public submit + admin | List | Yes | Yes | No E2E |
| Analytics/Backup/Settings | — | Stub | — | — | Missing |

**Working — do not reverse:** Startup write RPCs; narrow selects (no `select('*')` found); public form service-role path; `get_user_stats` RPC; `revalidateTag` on blogs/startups.

---

## 7. Database Issues

| Severity | Location | Problem | Fix |
|----------|----------|---------|-----|
| Medium | `profiles.role` default | Still `'admin'` in create migration | New migration → `'viewer'` |
| Medium | `interest_registrations` | Zod lengths only; fewer CHECKs than contact | Mirror contact length migration |
| Low | blogs `body_html` / categories | No DB size CHECKs | Optional defense-in-depth |
| — | startups slug GIN trgm | Present | Keep |
| — | RLS on all app tables | Present | Keep |
| — | Bucket id `auther` | Typo baked into migrations | Do not rename casually |

**Migrations present (high level):** profiles + `is_admin` + `handle_new_user`; role protection; user stats; interest registrations; contact messages; blogs + storage; startups + details + logos + write RPCs.

---

## 8. Performance Issues

| Severity | Location | Problem | Fix |
|----------|----------|---------|-----|
| Medium | Portfolio year filter | Full active list cached client-side; `getActiveStartupsPage` underused | Server-filter or paginate |
| Medium | `fetchRelatedPublishedBlogs` | Up to 3 sequential queries | Single query/RPC |
| Medium | Insights index | Possible double-fetch when no featured | One helper returning list + featured |
| Low | In-memory rate limit | Scale/abuse, not CPU | Redis later |

**Working:** `unstable_cache` + tags on public blogs/startups; marketing `s-maxage` / auth-dashboard `private, no-store` split; Sharp→WebP uploads; `Promise.all` on several detail/sitemap/users paths; middleware skips session refresh on marketing.

---

## 9. Architecture / Code Quality

| Check | Result |
|-------|--------|
| Components → Supabase | None found — good |
| Hooks → Supabase | None found — good |
| Pages → Supabase | `blogs/new`, `portfolio/new` — fix |
| Actions → components | `actions/auth.ts` → auth-labels — fix |
| Components → `data/` | Portfolio page content leak — tighten |
| `ts-pattern` in actions | Used in auth/users; uneven elsewhere |
| TODO/FIXME/HACK | **None** found |
| Empty catch blocks | **None** meaningful (cookie `setAll` catch documented) |
| `select('*')` | **None** found |
| Dead / stub code | Four empty dashboard pages; unused portfolio pagination data API path |

**Stack alignment:** shadcn Base Nova, `@base-ui/react`, Vitest + Playwright, Zod in `validations/`, `date-fns`, architecture folders respected in most places.

---

## 10. Validation & Error Handling

| Area | Status |
|------|--------|
| Create/update Zod on CMS entities | Good (client + server) |
| Contact DB CHECKs | Good |
| Interest DB CHECKs | Weaker than contact (Medium) |
| Media id Zod | Missing (Low) |
| Featured clear throws | Can surface unhandled Server Action error (tied to H4) |
| Auth unmapped errors | Raw message leak (Low) |
| Search list parsers escape PostgREST wildcards | Good |
| Route error UI | `error.tsx` in app + route groups; `global-error.tsx`; `not-found.tsx` |

---

## 11. Testing Gaps

| Layer | Approx coverage | Gap |
|-------|-----------------|-----|
| `validations/` | 6/6 colocated Vitest | Strong |
| `actions/` | **0** unit tests | Critical helpers untested |
| `data/` | 1 (`insights.test.ts`) | Most readers untested |
| `lib/` | Partial (rate-limit, turnstile, process-image, i18n, …) | OK |
| Component `*.test.tsx` | **Zero** | Forms/editor rely on E2E |
| Playwright | auth, users(+RLS), blogs(+non-admin), portfolio(+non-admin), contact(+non-admin), public-site | **No registrations E2E**; no non-admin-shell assertion; stub pages untested |

**CI note:** `test:e2e --pass-with-no-tests` can pass with empty suite — drop flag in CI. Specs that need credentials may skip when env missing (**Needs verification** in CI).

---

## 12. Missing Features / Incomplete Implementations

| Requirement source | Item | Status |
|--------------------|------|--------|
| RFQ / nav | Analytics | Stub |
| RFQ / nav | Backups | Stub |
| Nav | Settings | Stub |
| Dashboard | Home overview | Empty |
| `[1.6]` CookieYes | CMP | **Dropped** — out of scope |
| `[1.5]` / RFQ | Startup gallery, featured, cohort filters | Missing |
| RFQ | Impact / Partners top-level pages | Sections/hashes only |
| RFQ role CMS | Editor/viewer workflows | Schema only |
| Ops | Email for contact/apply | Missing |
| SEO `[1.3]` | GSC / Lighthouse 90+ | **Needs verification** |
| SEO | Dynamic OG per article/startup | Static default OG; titles only |

French locale routes exist (beyond RFQ “French-ready structure”) — **working**.

---

## 13. Dependency / Configuration Issues

| Item | Notes | Severity |
|------|--------|----------|
| `package.json` name `my-app` | Placeholder | Low |
| `boneyard-js` in `dependencies` | Prefer `devDependencies` if runtime-safe | Low |
| Patch drift | Next / TipTap / Supabase / lucide patches available | Low |
| Stack majors | React 19 / Next 16 / Zod 4 look intentional — keep | — |
| Middleware deprecation | Next 16 suggests `proxy` — track; do not rush | Low |
| `.env.example` | Placeholders only — good | — |

---

## 14. Edge Cases

- Featured blog race / failed second write → no featured.  
- Slug rename on blogs → stale old public path until tag TTL.  
- Delete entity after storage remove fails mid-way → broken URLs / orphan files.  
- Signup + email confirmation off → immediate dashboard access as viewer.  
- Concurrent featured toggles — unique index helps uniqueness, not restore previous featured.  
- Empty password on create user → `"password"`.  
- Rate limit bypass under multi-instance serverless.  
- Unique constraint collisions on slug/email — handled in several actions; keep covering in E2E.  
- Upload then DB fail — blogs/startups upload paths already roll back Storage (preserve that pattern).

---

## 15. What Is Working Correctly

Do **not** change without a strong reason:

1. Marketing Option A (navbar Apply; Login in footer; no auth-dependent marketing chrome).  
2. Middleware session refresh limited to dashboard + auth routes.  
3. `authorizeAdmin` + RLS on mutations.  
4. Public apply/contact: Turnstile + Zod + service-role insert (no anon table INSERT).  
5. Startup transactional write RPCs + previous-slug revalidation.  
6. Blog HTML sanitization (save + render).  
7. Versioned Storage paths, `upsert: false`, long `cacheControl`, Sharp→WebP.  
8. Narrow column selects; public `unstable_cache` + `revalidateTag`.  
9. Contact message length CHECKs; profile role-change protection trigger.  
10. Open-redirect guards on auth callback / `next`.  
11. `.env.example` placeholders; env files gitignored.  
12. Strong E2E for auth, blogs, startups, users, contact; Vitest for validations / insights / media.  
13. Designed `error.tsx` / `global-error` / `not-found` via shared error screens.  
14. CDN readiness foundations (see CDN report v2).  
15. Architecture folders and dependency direction in the majority of the codebase.

---

## 16. Prioritized Fix Plan

### P0 — Fix immediately

1. **C1** — Remove `USER_DEFAULT_PASSWORD`; require strong passwords on create.  
2. **C2** — Admin-gate dashboard layout (or close public signup / redirect viewers).  
3. **M1** — Migration: `profiles.role` default → `viewer`.  
4. **M4** — `import "server-only"` in `lib/supabase/admin.ts`.  
5. Confirm deployed DB has `handle_new_user` viewer default (**Needs verification**).

### P1 — Fix before production

6. **H4** — Blog featured clear + write RPC (transactional).  
7. **H6** — DB-first then storage on delete/remove (blogs + startups).  
8. **H5** — User update Auth↔profile consistency.  
9. **H3** — Ship or hide stub dashboard routes (analytics / backup / settings / home).  
10. Scrub seed/E2E credential defaults; env-only.  
11. Interest registration length CHECKs.  
12. Blog old-slug revalidation on rename.  
13. Apply/registrations **E2E**.  
14. Confirm host security headers or add CSP / frame-ancestors.

### P2 — Important improvements

16. Shared rate limiting (Redis/Upstash).  
17. Portfolio server-side year filter / pagination.  
18. Related blogs single query; insights featured helper.  
19. Architecture cleanups (`data/auth` in new pages; portfolio fetch in page; auth labels out of components).  
20. Zod on media action IDs.  
21. Real user identity in dashboard chrome.  
22. Drop `--pass-with-no-tests` in CI; add non-admin-shell E2E.  
23. Email/webhook for contact/apply.  
24. Scope decision: startups gallery/featured/cohort + editor/viewer roles.

### P3 — Nice-to-have

25. Shared admin pagination + Turnstile hook.  
26. Component Vitest for critical forms.  
27. Package rename; boneyard → `devDependencies` if safe.  
28. Patch bumps (Next/TipTap/etc.).  
29. Optional DB CHECKs for blog body/categories.  
30. Dashboard home stats widgets.  
31. Public startup details if product wants them.  
32. Sync Docs/[01] checklists with implemented reality.

---

## Appendix A — Needs verification

| Item | Why it matters |
|------|----------------|
| Production migrations applied (especially viewer signup default) | Privilege model |
| Auth email confirmation on/off | Immediate dashboard access after signup |
| Auth brute-force / CAPTCHA on login | No app-level login rate limit |
| Seed password reused on staging/prod | Known admin credential |
| Host security headers (CSP, HSTS, frame) | App config does not set them |
| Turnstile hostname allowlist in prod | Forms fail or open if misconfigured |
| GSC / Lighthouse SEO 90+ | Task [1.3] claim |
| CI runs Playwright with real credentials | Specs may skip |
| Impact/partners content completeness | Telecel-supplied assets |
| Whether in-memory rate limit is acceptable for launch traffic | Abuse surface |

---

## Appendix B — Docs/[01] vs code

| Doc | Verdict |
|-----|---------|
| `[1.1] Authentication` | Mostly done (doc checkboxes may still be unchecked) |
| `[1.2] Supabase setup` | Done |
| `[1.3] SEO setup` | Mostly done; GSC/Lighthouse unverified |
| `[1.4] Users CRUD` | Done for admin-only CMS; no page-size selector |
| `[1.5] Startups Portfolio CRUD` | Substantial subset; gallery/featured/cohort deferred |
| `[1.6] CookieYes` | **Dropped** — task file removed |

---

## Appendix C — Method notes

- Static review only; Vitest/build/E2E were **not** re-run for this scan.  
- Findings are grounded in current source under `app/`, `actions/`, `data/`, `validations/`, `lib/`, `supabase/migrations/`, `e2e/`, and Docs.  
- Theoretical issues without project-specific evidence were omitted or marked **Needs verification**.  
- Do not start fixes until this report is reviewed; then tackle P0 → P1 in order.
