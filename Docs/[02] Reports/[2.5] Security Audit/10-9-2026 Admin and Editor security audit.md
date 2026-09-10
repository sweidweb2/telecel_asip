# Security audit — Admin panel & Editor shell

**Date:** 10 September 2026  
**Reference:** `Docs/[10] Skills/security-audit.md` (auth, access control, injection, XSS, uploads, secrets, rate limiting)  
**Scope:** Admin panel (`/admin`, `lib/admin/`, admin actions, `app/api/admin/`) and Editor shell (`/dashboard` — there is no `/editor` route)  
**Status:** Findings only — no remediations applied in this pass  
**Related:** `Docs/[02] Reports/[2.3] Admin panel ui-ux/5-9-2026 Admin panel ui-ux report.md`

---

## Executive summary

Staff access control is mostly solid: layouts gate roles via `getStaffShell()`, mutations use `authorizeAdmin` / `authorizeEditor` / `authorizeStaff`, and Postgres RLS backs the app. No unauthenticated bypass into admin/editor was found.

The highest-impact gaps are:

1. Default staff password `"password"` on user create  
2. Editors can change peer editors’ Auth emails (account-takeover path)  
3. Broken `/admin/performance` self-redirect (monitoring UI unreachable)  
4. CSV exports: formula injection + unbounded PII dump without rate limits  

---

## Surfaces audited

| Surface | Path / area | Notes |
| --- | --- | --- |
| Admin panel | `app/(unlocalized)/(admin)/` | Admin-only shell; users, settings, backup, performance |
| Editor panel | `app/(unlocalized)/(dashboard)/` | CMS editor shell (labelled “Editor panel”) |
| Auth kernel | `lib/admin/` | `authorize*`, shells, list gates, mutations helper |
| Staff mutations | `actions/users.ts`, `actions/backups.ts`, CMS `actions/*` | Role-gated Server Actions |
| Export API | `app/api/admin/export/[table]/route.ts` | Editor-only CSV of intake/PII tables |
| Sanitizer / uploads | `lib/sanitize-html.ts`, media upload actions | Blog HTML + image pipeline |

---

## What’s already solid

1. **Server-side role gates** — layouts + `authorizeAdmin` / `authorizeEditor` / `authorizeStaff`; admins and editors are mutually redirected between `/admin` and `/dashboard`.
2. **DB defense in depth** — role-change triggers; editors cannot create/touch `admin`; only admins can change `backup_time`.
3. **Hard-delete** — admin-only; cannot target admins or self.
4. **Backups** — mutations/downloads require admin; cron uses Bearer secret (not query string).
5. **Injection hygiene** — PostgREST client (no raw SQL from app); `escapeIlikePattern` on searches.
6. **XSS (blogs)** — `sanitizeBlogHtml` on save; public render re-sanitizes; no `dangerouslySetInnerHTML` in admin/editor UI.
7. **Uploads** — editor auth, size/MIME, Sharp → WebP, versioned paths, `upsert: false`.
8. **Cache** — `/admin/*` and `/dashboard/*` use `private, no-store`; exports `no-store`; `robots: noindex`.
9. **Secrets** — `createAdminClient` is `server-only`; signing/R2 stay server-side.
10. **Redirects / framing** — `safeRedirectPath` for post-auth `next`; HSTS, `X-Frame-Options: DENY`, `frame-ancestors 'none'`.

---

## Findings (by severity)

### Critical

*None confirmed.* No unauthenticated path into admin/editor mutations, and no viewer→admin privilege escalation was evidenced.

---

### High

#### ADM-01 — Default staff password is `"password"`

| | |
| --- | --- |
| **Area** | Authentication |
| **Where** | `validations/users.ts` (`USER_DEFAULT_PASSWORD`); `components/users/user-dialogs.tsx`; `actions/users.ts` `createUser` |
| **Problem** | Empty create-user password becomes literal `"password"` and Zod explicitly allows it. UI advertises the default. |
| **Risk** | New editor/viewer accounts are guessable; pairs badly with email confirm-on-create. |
| **Fix** | Always require a strong password; remove the default; prefer invite / change-on-first-login; never allow `"password"`. |

#### ADM-02 — Editors can change peer editors’ Auth emails

| | |
| --- | --- |
| **Area** | Privilege escalation / IDOR-adjacent |
| **Where** | `actions/users.ts` `updateUser` — `createAdminClient().auth.admin.updateUserById` with new email |
| **Problem** | After `authorizeStaff`, an editor may update another `editor`/`viewer` email via the service-role Auth Admin API with no step-up or ownership proof. |
| **Risk** | Editor A sets Editor B’s email to an attacker mailbox → password reset → peer account takeover (CMS + exports + user mgmt). |
| **Fix** | Restrict email changes to admins; or require re-auth + confirmation to the current email; block editors from mutating other editors; prefer invite/reset flows. |

#### ADM-03 — `/admin/performance` infinite self-redirect

| | |
| --- | --- |
| **Area** | Admin route / monitoring availability |
| **Where** | `app/(unlocalized)/(admin)/admin/performance/page.tsx` and `app/(unlocalized)/(dashboard)/dashboard/performance/page.tsx` both `redirect(ROUTES.adminPerformance)` |
| **Problem** | Admin performance page redirects to itself. `AdminPerfDashboard` exists in `components/dashboard/admin-perf-dashboard.tsx` but is not mounted. |
| **Risk** | Not a data breach; removes admin performance visibility and loops staff who open that nav item. |
| **Fix** | Restore the performance UI under `/admin/performance` (admin-gated). Keep `/dashboard/performance` as a one-way bookmark redirect only. |

---

### Medium

#### ADM-04 — CSV formula injection in Quick Export

| | |
| --- | --- |
| **Area** | Injection (spreadsheet formulas) |
| **Where** | `lib/backups/serialize.ts` `escapeCsvCell`; used by `app/api/admin/export/[table]/route.ts` |
| **Problem** | Escapes quotes/newlines only; cells starting with `=`, `+`, `-`, `@` are not neutralized. |
| **Risk** | Malicious intake content (e.g. `=CMD(...)`) opens as a formula when staff open the CSV in Excel. |
| **Fix** | Prefix risky cells (e.g. `'`) or force text for all user-influenced columns. |

#### ADM-05 — Unbounded, unrate-limited PII CSV export

| | |
| --- | --- |
| **Area** | API & rate limiting / data exposure |
| **Where** | `app/api/admin/export/[table]/route.ts` |
| **Problem** | Editor GET dumps full allowlisted tables (applications, registrations, contact, newsletter) with no row cap and no `consumeSharedRateLimit`. |
| **Risk** | Stolen editor session or insider repeatedly exports full applicant/contact PII; large responses stress the app. |
| **Fix** | Cap/paginate; rate-limit by userId+IP; audit-log exports; consider admin-only or dual-control for bulk PII. |

#### ADM-06 — Editors can delete peer editors

| | |
| --- | --- |
| **Area** | Function-level permissions |
| **Where** | `actions/users.ts` `deleteUser` |
| **Problem** | Editors may delete other editors (blocked only for admins / last editor / self). Uses Auth Admin `deleteUser`. |
| **Risk** | Compromised editor removes peers, then recreates accounts (worse with ADM-01). |
| **Fix** | Editor deletes → viewers only; peer editor delete admin-only. |

#### ADM-07 — Protocol-relative URLs allowed in blog HTML sanitizer

| | |
| --- | --- |
| **Area** | XSS / phishing via output encoding |
| **Where** | `lib/sanitize-html.ts` `safeHref` — `href.startsWith("/")` also matches `//evil.example` |
| **Problem** | Unlike `safeRedirectPath`, the sanitizer accepts protocol-relative links. |
| **Risk** | Malicious editor publishes `//attacker` links on Insights; readers phished. Classic script XSS is otherwise mitigated. |
| **Fix** | Reject `href.startsWith("//")`; allow only `https?:`, `mailto:`, `tel:`, single-slash paths, `#`. |

#### ADM-08 — Settings save always writes `newsletterSignupEnabled: false`

| | |
| --- | --- |
| **Area** | Integrity / input handling |
| **Where** | `components/settings/site-settings-form.tsx`; `components/settings/admin-backup-settings-form.tsx` |
| **Problem** | Every settings save forces newsletter signup off regardless of DB state. |
| **Risk** | Not classic attacker-driven; any staff save silently disables a public feature. |
| **Fix** | Load and persist the real `newsletterSignupEnabled` value; do not hardcode `false`. |

---

### Low

#### ADM-09 — No rate limits on sensitive staff mutations

| | |
| --- | --- |
| **Area** | API & rate limiting |
| **Where** | `actions/users.ts`, `actions/backups.ts`, export route (contrast public forms using `lib/rate-limit.ts`) |
| **Problem** | User create/delete, backups, and exports lack shared rate limits. |
| **Fix** | Apply per-staff-userId limits on createUser, hardDelete, backup create, CSV export. |

#### ADM-10 — Staff can read `backup_time` via RLS

| | |
| --- | --- |
| **Area** | Data over-exposure |
| **Where** | site_settings RLS / `data/settings.ts` `getSiteSettingsForAdmin` |
| **Problem** | UPDATE of `backup_time` is admin-only; SELECT of base `site_settings` is `is_staff()`, so editors can still read the schedule (UI hides it). |
| **Fix** | Column privilege / editor view without `backup_time`, or tighter SELECT policy. |

#### ADM-11 — Middleware is role-blind (auth only)

| | |
| --- | --- |
| **Area** | Default-deny / admin lockdown |
| **Where** | `middleware.ts` `isProtectedPath` — session refresh for `/admin` and `/dashboard` |
| **Problem** | Viewers hitting `/admin` get HTML then layout redirect. Safe if layouts/actions/RLS hold; not early deny. |
| **Fix** | Optional early role check in middleware; keep layout/action checks as source of truth. |

#### ADM-12 — `gatePageData` loads data in parallel with auth

| | |
| --- | --- |
| **Area** | Authorization hygiene |
| **Where** | `lib/admin/admin-list-query.ts` |
| **Problem** | Query may run even when access will be denied; response is still `forbidden`. Relies on RLS. |
| **Fix** | Await auth first for admin-only datasets, or keep as-is with RLS as the hard boundary. |

---

### Info

| ID | Note |
| --- | --- |
| **ADM-I1** | Editor panel is `/dashboard`, not `/editor`. |
| **ADM-I2** | Admins are not editors (`is_editor()` is role-exclusive). CMS mutations and CSV export require editor role — intentional split; admins cannot call the editor export API. |
| **ADM-I3** | `createUser` sets `email_confirm: true` — expected for staff tooling; pairs badly with ADM-01 / ADM-02. |
| **ADM-I4** | Full CSP `script-src` is not present (frame-ancestors-only documented); staff UI mitigated by React escaping + blog sanitizer. |
| **ADM-I5** | `getSiteSettingsForAdmin` has no internal auth; safe when callers use `requireAdmin` / `requireEditor` + RLS. |

---

## Checked OK / N/A (this scope)

| Theme (from security-audit skill) | Status |
| --- | --- |
| SQL injection in admin/editor queries | OK — Supabase query builder; ilike escaped |
| `dangerouslySetInnerHTML` in admin/editor UI | OK — none found |
| CORS wildcards on admin APIs | OK — same-origin; no loose CORS config |
| CSRF on Server Actions | OK — Next origin checks; mutations are Server Actions |
| Service role in client bundles | OK — `server-only` on `lib/supabase/admin.ts` |
| Path traversal on uploads | OK — server-generated `${id}/${nanoid}.webp` |
| Sensitive page caching | OK — `private, no-store` for `/admin` and `/dashboard` |
| Backup download auth | OK — `authorizeAdmin` + short-lived signed URL |
| Open redirect on staff login `next=` | OK — `safeRedirectPath` |
| Mass assignment of `role` via public profile update | OK — trigger + Zod allowlists on staff paths |
| GraphQL / LDAP / XML in staff surfaces | N/A |
| Multi-tenant isolation | N/A — single-tenant staff CMS |

---

## Needs verification

1. Whether PostgREST silently caps export row counts (~1000) vs a true full-table dump.
2. Whether any admin TipTap preview path renders HTML without going through `sanitizeBlogHtml`.
3. Whether any production staff accounts already use password `password` — rotate if so (ADM-01).

---

## Priority remediation order

1. **ADM-01** — Kill default `"password"`; harden create-user passwords.  
2. **ADM-02 / ADM-06** — Lock down editor peer email change and peer delete.  
3. **ADM-03** — Restore `/admin/performance` UI (stop self-redirect).  
4. **ADM-04 / ADM-05 / ADM-09** — Harden CSV export (formulas + limits + rate limits).  
5. **ADM-07 / ADM-08** — Fix `safeHref` and settings newsletter overwrite.

---

## Suggested next step

Say if you want these remediations applied (recommended: High first, then Medium), as a single branch or one commit per finding.
