# Full project audit — ASIP (Telecel)

**Date:** 27 August 2026  
**Scope:** Entire Next.js + Supabase app (frontend, backend, DB, auth, tests, deps, structure)  
**Method:** Read-only code review; flows traced UI → actions/data → Supabase → UI. No production runtime verification.  
**Status:** No code changes made — review before fixes.

---

## 1. Executive Summary

**Overall health:** Solid mid-maturity CMS + bilingual marketing site. Core CRUD for blogs, startups, users, contact, and interest registrations works with Zod + admin gates + RLS. CDN/media foundations and startup transactional write RPCs are in good shape.

**Working well:** Marketing Option A (no auth peek on public chrome), dual admin gate (`authorizeAdmin` + RLS), public forms (Turnstile + service-role insert), blog HTML sanitization, versioned Storage uploads, startups create/update RPCs, tagged public caches, Vitest + strong CMS E2E for blogs/startups/users/contact/auth.

**Broken / incomplete:** Four dashboard nav destinations are empty stubs; dashboard is auth-gated not admin-gated (any signup user sees admin chrome); create-user allows literal default password `"password"`.

**Biggest risks**

1. Non-admin access to full admin shell (attack surface + UX confusion).  
2. Weak default admin password on user create.  
3. Non-transactional blog featured clear → can leave zero featured posts.  
4. Storage delete before DB commit on media/entity delete (orphan/broken URLs).  
5. Committed seed/E2E credentials; `profiles.role` SQL default still `'admin'`.

---

## 2. Critical Issues

No confirmed Critical (remote RCE / open service-role / anon write to CMS tables). Highest findings are **High**.

| ID | Severity | Summary |
|----|----------|---------|
| H1 ✅ | High | Dashboard layout not admin-gated; public signup reaches admin shell |
| H2 | High | `createUser` empty password → `"password"` |
| H3 | High | Four dashboard routes are empty stubs (nav still links) |
| H4 ✅ | High | Blog featured clear + write not transactional |
| H5 ✅ | High | User Auth Admin update then profile update not atomic |
| H6 ✅ | High | Storage `remove` before DB update/delete (blogs/startups) |

---

## 3. Security Audit

### H1 ✅ — Dashboard auth-only, not admin-only

| | |
|---|---|
| **Location** | `middleware.ts` (`isProtectedPath`); `app/(dashboard)/layout.tsx` (no `is_admin`); `actions/auth.ts` `signUp` |
| **Problem** | Middleware requires a session for `/dashboard/*`. Layout never calls `is_admin`. Signup creates `viewer` via `handle_new_user`, then user can open admin chrome. Data pages redirect on `forbidden`, but `/dashboard`, analytics, backup, settings stay reachable. |
| **Impact** | Privilege UX mismatch; wider surface for future dashboard features. |
| **Recommended fix** | Gate dashboard layout (or middleware) with `is_admin()`; redirect non-admins to marketing home; optionally invite-only signup. |
| **Dependencies** | Product: invite-only CMS vs open registration. |

### H2 — Default password `"password"`

| | |
|---|---|
| **Location** | `validations/users.ts` `USER_DEFAULT_PASSWORD`, `createPasswordSchema` (~L15, L38–42); `actions/users.ts` `createUser` |
| **Problem** | Empty password transforms to `"password"` and is accepted via `z.literal`, bypassing strength rules. Role locked to `admin`. |
| **Impact** | New CMS admins with a trivial password. |
| **Recommended fix** | Remove default; require strong password always. |
| **Dependencies** | Users create dialog UX. |

### M1 ✅ — `profiles.role` default `'admin'`

| | |
|---|---|
| **Location** | `supabase/migrations/20260822183000_create_profiles.sql` L10 |
| **Problem** | Column default remains `admin`; trigger defaults signup to `viewer`, but omitted-role inserts escalate. |
| **Impact** | Accidental privilege escalation if profile path changes. |
| **Recommended fix** | New migration: `alter column role set default 'viewer'`. |

### M2 — In-memory rate limit

| | |
|---|---|
| **Location** | `lib/rate-limit.ts`; contact + interest actions |
| **Problem** | Process-local `Map`; not shared across serverless instances. |
| **Impact** | Easy bypass at scale; Turnstile remains primary. |
| **Recommended fix** | Redis/Upstash or edge WAF when abuse appears. |

### M3 — Hardcoded E2E/seed credentials

| | |
|---|---|
| **Location** | `supabase/seed.sql`; `e2e/*.spec.ts` fallbacks (`asweid657@gmail.com` / `ali@1234`) |
| **Problem** | Real-looking credentials in repo. |
| **Impact** | If reused on shared staging/prod, known admin password. |
| **Recommended fix** | Env-only; fail closed when missing; rotate if ever used outside local. |

### M4 ✅ — `createAdminClient` missing `server-only`

| | |
|---|---|
| **Location** | `lib/supabase/admin.ts` |
| **Problem** | Service-role client; nothing blocks accidental client import. |
| **Impact** | Bundle leak of `SUPABASE_SERVICE_ROLE_KEY` if mis-imported. |
| **Recommended fix** | `import "server-only"` at top. |

### M5 ✅ — No app-level CSP / frame / HSTS in `next.config.ts`

| | |
|---|---|
| **Location** | `next.config.ts` `headers()` (cache only) |
| **Problem** | Security headers not set in app config. |
| **Impact** | Weaker XSS/clickjacking defense (DOMPurify still on blogs). |
| **Recommended fix** | Add headers in Next or confirm host already injects them. |
| **Needs verification** | Host (Vercel/Cloudflare) may already set these. |

### Low security

- ✅ Media upload/remove IDs not Zod-validated (`actions/blogs.ts`, `actions/startups.ts`).  
- ✅ `actions/auth.ts` `mapAuthError` `.otherwise` can return raw Supabase messages.  
- ✅ `updateUser` does not sync `app_metadata.app_role` (OK today because `is_admin()` uses profiles).  
- ✅ `get_user_stats` executable by any authenticated user (RLS skews results for non-admins).

### Needs verification

| Item | Why |
|------|-----|
| Email confirmation enabled | Affects immediate session after signup |
| Auth brute-force / CAPTCHA on login | No app rate limit on `signIn` |
| Seed password on staging/prod | Hardcoded defaults may match live |
| Git history of previously tracked `.env` | Rotate if secrets ever leaked |
| Live RLS == applied migrations | Per environment |

### Security — do not change

- Option A marketing (no session peek; middleware refresh scoped).  
- `authorizeAdmin` + RLS dual gate.  
- Public forms: no anon INSERT; service role after Zod + Turnstile.  
- `handle_new_user` role from `app_metadata` only.  
- Profile role self-promotion trigger.  
- Storage admin-write / public-read + versioned paths.  
- Blog DOMPurify sanitize.  
- Open-redirect hardening on auth `next` / callback.

---

## 4. Functional / Business Logic Issues

### H4 ✅ — Featured blog clear not transactional

| | |
|---|---|
| **Location** | `actions/blogs.ts` `clearOtherFeatured` + `createBlog` / `updateBlog` |
| **Problem** | Clear other featured, then insert/update as separate statements. Second failure → zero featured. |
| **Impact** | Marketing hero blank; concurrent races. |
| **Recommended fix** | Transactional RPC (mirror startups pattern). |

### H5 ✅ — User update split Auth ↔ profile

| | |
|---|---|
| **Location** | `actions/users.ts` `updateUser` |
| **Problem** | Auth Admin update then profiles update; profile failure leaves split identity. |
| **Impact** | Login email ≠ CMS list email. |
| **Recommended fix** | Compensating rollback or sync trigger; sync `app_metadata` when roles unlock. |

### Public startup details unused

| | |
|---|---|
| **Location** | `data/startups.ts` `fetchActiveStartupBySlug`; public detail UI |
| **Problem** | Admin loads `startup_details`; public page uses core columns only (appears intentional). |
| **Impact** | Product gap only if details were meant for marketing. |
| **Severity** | Low / product |

### Role product surface half-built

| | |
|---|---|
| **Location** | `USER_ROLES` vs `USER_FORM_ROLE = "admin"` |
| **Problem** | Filters imply editor/viewer; UI can only create admins. |
| **Impact** | Misleading admin UX. |
| **Severity** | Medium |

---

## 5. Frontend Issues

| Severity | Location | Problem | Fix |
|----------|----------|---------|-----|
| High | `dashboard/{page,analytics,settings,backup}/page.tsx` + nav | Empty stubs | Content or hide nav |
| Medium | `getDashboardPageTitle` | Nested routes show title “Dashboard” | Longest-prefix match |
| Medium | Sidebar / header | Hardcoded “Admin” / “AD” | Pass real profile |
| Medium ✅ | Apply vs Contact forms | Duplicated Turnstile lifecycle | Shared hook/component |
| Low ✅ | Admin list pagination ×3 | Near-identical | Shared component |
| Low | Locale `loading.tsx` | Plain Skeleton vs `RouteSkeleton` | Align when convenient |

**Working:** Marketing responsive nav/sheet, error boundaries (`error.tsx` / `global-error` / `not-found`), empty states on CMS lists and public filters, RHF+Zod forms, no Radix/Zustand/TanStack Query on initial load.

---

## 6. Backend / API Issues

| Severity | Location | Problem | Fix |
|----------|----------|---------|-----|
| High ✅ | blogs/startups delete & remove image | Storage before DB | DB first, then storage; log cleanup failures |
| Medium ✅ | `actions/blogs.ts` `updateBlog` | Old slug not revalidated | Mirror startups `previous_slug` |
| Medium | `actions/auth.ts` → `components/auth/auth-labels` | Wrong dependency direction | Move messages to `lib/` / `constants/` |
| Medium ✅ | blogs/new, portfolio/new pages | Direct Supabase + `is_admin` | Use `data/auth` |
| Low ✅ | `signOut` | Ignores Auth errors | Log then redirect |

**CRUD matrix:** Blogs, startups, users, registrations, contact — create/list/update/delete present. Missing dedicated admin `getById` for users/registrations/contact (list-driven UI only — Low).

**Working — do not reverse:** Startup `create_startup_with_details` / `update_startup_with_details` RPCs; narrow selects; public form service-role path; `get_user_stats` RPC.

---

## 7. Database Issues

| Severity | Location | Problem | Fix |
|----------|----------|---------|-----|
| Medium ✅ | `profiles.role` default | `'admin'` | Migration → `'viewer'` |
| Medium ✅ | `interest_registrations` | Zod lengths only; no CHECKs | Mirror contact length migration |
| Low ✅ | blogs `body_html` / categories | No DB size CHECKs | Optional defense-in-depth |
| — | startups slug GIN trgm | Present | Keep |
| — | RLS on all app tables | Present | Keep |

---

## 8. Performance Issues

| Severity | Location | Problem | Fix |
|----------|----------|---------|-----|
| Medium ✅ | `getAllActiveStartups` + client year filter | Full list in cache; `getActiveStartupsPage` unused | Server-filter or paginate |
| Medium ✅ | `fetchRelatedPublishedBlogs` | Up to 3 sequential queries | Single query/RPC |
| Medium ✅ | Insights index | Possible double-fetch when no featured | One helper returning list + featured |
| Low | In-memory rate limit | Not a perf issue; scale/abuse | Redis later |

**Working:** `unstable_cache` + tags on public blogs/startups; marketing `s-maxage` split; Sharp→WebP uploads; `Promise.all` on several detail pages.

---

## 9. Architecture / Code Quality

| Check | Result |
|-------|--------|
| Components → Supabase | None found — good |
| Hooks → Supabase | None found — good |
| Components → `data/` | `portfolio-page-content.tsx` (layering leak) |
| Pages → Supabase | ✅ fixed (blogs/new, portfolio/new now use `data/auth`) |
| Actions → components | `actions/auth.ts` → auth-labels |
| `ts-pattern` | Used in auth/users; uneven elsewhere |
| Dead / stub code | Four empty dashboard pages; unused portfolio pagination data API |

---

## 10. Validation & Error Handling

| Area | Status |
|------|--------|
| Create/update Zod on CMS entities | Good |
| Contact DB CHECKs | Good |
| Interest DB CHECKs | ✅ Added |
| Media id Zod | ✅ Added |
| Featured clear throws | ✅ Handled by transactional RPC |
| Auth unmapped errors | ✅ Logged; generic message shown |
| Search list parsers escape PostgREST wildcards | Good |

---

## 11. Testing Gaps

| Flow | Coverage | Gap |
|------|----------|-----|
| Auth | Strong E2E + Zod unit | Non-admin must not see admin nav untested |
| Blogs / startups CMS | Strong E2E | — |
| Contact | Strong E2E | — |
| Apply / registrations | Unit only | **No E2E** for submit / admin CRUD |
| Component tests | **Zero** `*.test.tsx` | Forms/editor rely on E2E |
| Stub dashboard pages | Untested | — |
| `test:e2e --pass-with-no-tests` | CI can pass empty | Drop flag in CI |

---

## 12. Missing Features / Incomplete Implementations

1. Dashboard home, analytics, settings, backup — empty.  
2. Editor/viewer roles — enum + filters exist; create UI locks admin.  
3. Public startup detail fields from `startup_details` — unused (product).  
4. Shared rate-limit store — not implemented.  
5. Invite-only / admin-only dashboard access — not implemented.

---

## 13. Dependency / Configuration Issues

| Item | Notes |
|------|--------|
| `package.json` name `my-app` | Placeholder |
| `boneyard-js` in `dependencies` | Prefer `devDependencies` if runtime-safe with `BoneyardSetup` |
| Patch drift | Next 16.3.1→16.3.3, TipTap/Supabase/lucide patches available — Low |
| Stack majors | React 19 / Next 16 / Zod 4 look intentional — keep |
| Middleware deprecation warning | Next 16 suggests `proxy` — track; do not rush without guide |

---

## 14. Edge Cases

- Featured blog race / failed second write → no featured.  
- Slug rename on blogs → stale old public path until tag TTL.  
- Delete entity after storage remove fails mid-way → broken URLs.  
- Signup + confirmations off → immediate dashboard access as viewer.  
- Concurrent featured toggles — unique index helps uniqueness, not restore previous featured.  
- Empty password on create user → `"password"`.  
- Rate limit bypass under multi-instance serverless.

---

## 15. What Is Working Correctly

Do **not** change without strong reason:

1. Marketing Option A (navbar Apply; Login in footer; no auth-dependent marketing chrome).  
2. Middleware session refresh limited to dashboard + auth routes.  
3. `authorizeAdmin` + RLS on mutations.  
4. Public apply/contact: Turnstile + Zod + service-role insert (no anon table INSERT).  
5. Startup transactional write RPCs + previous_slug revalidation.  
6. Blog HTML sanitization (save + render).  
7. Versioned Storage paths, `upsert: false`, long `cacheControl`, Sharp→WebP.  
8. Narrow column selects; public `unstable_cache` + `revalidateTag`.  
9. Contact message length CHECKs; profile role-change protection trigger.  
10. Open-redirect guards on auth callback / `next`.  
11. `.env.example` placeholders; env files gitignored.  
12. Strong E2E for auth, blogs, startups, users, contact; Vitest for validations/insights/media.  
13. Designed `error.tsx` / `global-error` / `not-found` via shared error screens.  
14. CDN readiness foundations (see CDN report v2).

---

## 16. Prioritized Fix Plan

### P0 — Fix immediately

1. **H2** — Remove `USER_DEFAULT_PASSWORD`; require strong passwords on create.  
2. **H1** ✅ — Admin-gate dashboard layout (or close public signup / redirect viewers).  
3. **M1** ✅ — Migration: `profiles.role` default → `viewer`.  
4. **M4** ✅ — `import "server-only"` in `lib/supabase/admin.ts`.

### P1 — Fix before production

5. **H4** ✅ — Blog featured clear + write RPC (transactional).  
6. **H6** ✅ — DB-first then storage on delete/remove (blogs + startups).  
7. **H5** ✅ — User update Auth↔profile consistency.  
8. **H3** — Ship or hide stub dashboard routes.  
9. **M3** — Scrub seed/E2E credential defaults; env-only.  
10. ✅ **Interest registration** length CHECKs.  
11. ✅ **Blog** old-slug revalidation on rename.  
12. Apply/registrations **E2E**.  
13. ✅ Confirm host security headers or add CSP/frame-ancestors.

### P2 — Important improvements

14. Shared rate limiting (Redis).  
15. ✅ Portfolio server-side year filter / pagination.  
16. ✅ Related blogs single query; insights featured helper.  
17. Architecture cleanups (✅ `data/auth` in new pages; portfolio fetch in page; auth labels out of components).  
18. ✅ Zod on media action IDs.  
19. Real user identity in dashboard chrome.  
20. Drop `--pass-with-no-tests` in CI; add non-admin-shell E2E.

### P3 — Nice-to-have

21. ✅ Shared admin pagination + Turnstile hook.  
22. Component Vitest for critical forms.  
23. Package rename; boneyard → devDependency if safe.  
24. Patch bumps (Next/TipTap/etc.).  
25. ✅ Optional DB CHECKs for blog body/categories.  
26. Implement or remove editor/viewer role UI.  
27. Public startup details if product wants them.

---

## Appendix — Verification notes

- Live Supabase Auth settings, host headers, and whether seed creds exist outside local: **Needs verification**.  
- This audit did not re-run Vitest/build/E2E; recent local quality gate (Vitest 84, typecheck, lint, build) was green in a prior session — **Needs re-verification** after any P0/P1 fixes.
