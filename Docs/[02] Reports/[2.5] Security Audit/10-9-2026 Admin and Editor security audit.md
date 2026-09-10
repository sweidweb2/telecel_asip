# Security audit — Admin panel & Editor shell

**Date:** 10 September 2026  
**Reference:** `Docs/[10] Skills/security-audit.md` (auth, access control, injection, XSS, uploads, secrets, rate limiting)  
**Scope:** Admin panel (`/admin`, `lib/admin/`, admin actions, `app/api/admin/`) and Editor shell (`/dashboard` — there is no `/editor` route)  
**Status:** Findings report + remediations for **ADM-02**–**ADM-12** (10 Sep 2026; **ADM-01** still open)  
**Related:** `Docs/[02] Reports/[2.3] Admin panel ui-ux/5-9-2026 Admin panel ui-ux report.md`

---

## Executive summary

Staff access control is mostly solid: layouts gate roles via `getStaffShell()`, mutations use `authorizeAdmin` / `authorizeEditor` / `authorizeStaff`, and Postgres RLS backs the app. No unauthenticated bypass into admin/editor was found.

The highest-impact gaps are:

1. Default staff password `"password"` on user create *(still open — ADM-01)*  
2. ~~Editors can change peer editors’ Auth emails (account-takeover path)~~ ✅ **Fixed (ADM-02)**  
3. ~~Broken `/admin/performance` self-redirect (monitoring UI unreachable)~~ ✅ **Fixed (ADM-03)**  
4. ~~CSV exports: formula injection + unbounded PII dump without rate limits~~ ✅ **Fixed (ADM-04, ADM-05)**  

**Remediation log**

| ID | Status | Fix |
| --- | --- | --- |
| ADM-01 | open | Default staff password `"password"` — still open |
| ADM-02 | ✅ | `updateUser` rejects email changes unless actor is admin; edit dialog email field is read-only for editors |
| ADM-03 | ✅ | Restored `AdminPerfDashboard` on `/admin/performance`; `/dashboard/performance` remains a one-way redirect |
| ADM-04 | ✅ | `escapeCsvCell` prefixes cells matching formula triggers (`=`, `+`, `-`, `@`, incl. leading whitespace) with `'` |
| ADM-05 | ✅ | Export capped at 5 000 rows; rate-limited 10/user and 20/IP per hour; structured `[admin-export]` log; 429 + `Retry-After` |
| ADM-06 | ✅ | Editors may delete viewers only; peer editor/admin delete is admin-only |
| ADM-07 | ✅ | `safeHref` rejects protocol-relative `//` URLs |
| ADM-08 | ✅ | Settings forms load and persist real `newsletterSignupEnabled` (no forced `false`) |
| ADM-09 | ✅ | `consumeStaffMutationRateLimit` on createUser / deleteUser / hardDelete / createBackup / runBackupNow (export already limited) |
| ADM-10 | ✅ | Column grant hides `backup_time`; `get_admin_backup_schedule` RPC for admins only |
| ADM-11 | ✅ | Middleware calls `get_staff_shell` and redirects wrong roles before layout HTML |
| ADM-12 | ✅ | `gatePageData` awaits auth first; load skipped on forbidden |

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

#### ADM-01 — Default staff password is `"password"` *(open)*

| | |
| --- | --- |
| **Area** | Authentication |
| **Where** | `validations/users.ts` (`USER_DEFAULT_PASSWORD`); `components/users/user-dialogs.tsx`; `actions/users.ts` `createUser` |
| **Problem** | Empty create-user password becomes literal `"password"` and Zod explicitly allows it. UI advertises the default. |
| **Risk** | New editor/viewer accounts are guessable; pairs badly with email confirm-on-create. |
| **Fix** | Always require a strong password; remove the default; prefer invite / change-on-first-login; never allow `"password"`. |

#### ✅ ADM-02 — Editors can change peer editors’ Auth emails — **FIXED**

| | |
| --- | --- |
| **Area** | Privilege escalation / IDOR-adjacent |
| **Where** | `actions/users.ts` `updateUser`; `components/users/user-dialogs.tsx` |
| **Problem** | After `authorizeStaff`, an editor may update another `editor`/`viewer` email via the service-role Auth Admin API with no step-up or ownership proof. |
| **Risk** | Editor A sets Editor B’s email to an attacker mailbox → password reset → peer account takeover (CMS + exports + user mgmt). |
| **Fix applied** | Server: if email changes and actor is not admin → error `"Only administrators can change account emails."`. UI: email input is `readOnly` for editors. |

#### ✅ ADM-03 — `/admin/performance` infinite self-redirect — **FIXED**

| | |
| --- | --- |
| **Area** | Admin route / monitoring availability |
| **Where** | `app/(unlocalized)/(admin)/admin/performance/page.tsx`; dashboard redirect kept at `app/(unlocalized)/(dashboard)/dashboard/performance/page.tsx` |
| **Problem** | Admin performance page redirected to itself. `AdminPerfDashboard` existed but was not mounted. |
| **Risk** | Not a data breach; removes admin performance visibility and loops staff who open that nav item. |
| **Fix applied** | Restored admin-gated performance UI (`getAdminPerfEventsPageData` + `AdminPerfDashboard`). `/dashboard/performance` still redirects to `/admin/performance` only. |

---

### Medium

#### ✅ ADM-04 — CSV formula injection in Quick Export — **FIXED**

| | |
| --- | --- |
| **Area** | Injection (spreadsheet formulas) |
| **Where** | `lib/backups/serialize.ts` `escapeCsvCell`; used by `app/api/admin/export/[table]/route.ts` |
| **Problem** | Escapes quotes/newlines only; cells starting with `=`, `+`, `-`, `@` are not neutralized. |
| **Risk** | Malicious intake content (e.g. `=CMD(...)`) opens as a formula when staff open the CSV in Excel. |
| **Fix applied** | Prefix cells matching `/^[\t\r ]*[=+\-@]/` with `'` before CSV quoting. |

#### ✅ ADM-05 — Unbounded, unrate-limited PII CSV export — **FIXED**

| | |
| --- | --- |
| **Area** | API & rate limiting / data exposure |
| **Where** | `app/api/admin/export/[table]/route.ts` |
| **Problem** | Editor GET dumps full allowlisted tables with no row cap and no `consumeSharedRateLimit`. |
| **Risk** | Stolen editor session or insider repeatedly exports full applicant/contact PII; large responses stress the app. |
| **Fix applied** | `.limit(5000)`; shared rate limits by userId (10/h) and IP (20/h); 429 + `Retry-After`; `[admin-export]` structured log; `X-Export-Row-Count` / `X-Export-Truncated` headers. |

#### ✅ ADM-06 — Editors can delete peer editors — **FIXED**

| | |
| --- | --- |
| **Area** | Function-level permissions |
| **Where** | `actions/users.ts` `deleteUser`; `components/users/user-dialogs.tsx` |
| **Problem** | Editors may delete other editors (blocked only for admins / last editor / self). |
| **Risk** | Compromised editor removes peers, then recreates accounts (worse with ADM-01). |
| **Fix applied** | Editors may delete `viewer` only; UI disables delete for non-viewers. |

#### ✅ ADM-07 — Protocol-relative URLs allowed in blog HTML sanitizer — **FIXED**

| | |
| --- | --- |
| **Area** | XSS / phishing via output encoding |
| **Where** | `lib/sanitize-html.ts` `safeHref` |
| **Problem** | `href.startsWith("/")` also matched `//evil.example`. |
| **Risk** | Malicious editor publishes `//attacker` links on Insights; readers phished. |
| **Fix applied** | Allow only `https?:`, `mailto:`, `tel:`, `#`, and single-slash paths (`/` but not `//`). |

#### ✅ ADM-08 — Settings save always writes `newsletterSignupEnabled: false` — **FIXED**

| | |
| --- | --- |
| **Area** | Integrity / input handling |
| **Where** | `components/settings/site-settings-form.tsx`; `admin-backup-settings-form.tsx`; settings/backup pages |
| **Problem** | Every settings save forced newsletter signup off regardless of DB state. |
| **Risk** | Any staff save silently disabled a public feature. |
| **Fix applied** | Prop from `getSiteSettingsForAdmin`; persist submitted value; phase-1 UI remains non-toggleable but no longer overwrites. |

---

### Low

#### ✅ ADM-09 — No rate limits on sensitive staff mutations — **FIXED**

| | |
| --- | --- |
| **Area** | API & rate limiting |
| **Where** | `actions/users.ts`, `actions/backups.ts`, export route |
| **Problem** | User create/delete, backups, and exports lacked shared rate limits. |
| **Fix applied** | `consumeStaffMutationRateLimit` (hourly): create 20, delete 20, hard-delete 10, backup create/run-now 10; CSV export already limited (ADM-05). |

#### ✅ ADM-10 — Staff can read `backup_time` via RLS — **FIXED**

| | |
| --- | --- |
| **Area** | Data over-exposure |
| **Where** | migration `20260910240000_…`; `data/settings.ts`; `get_admin_backup_schedule` |
| **Problem** | Editors could SELECT `backup_time` via base `site_settings`. |
| **Fix applied** | Column grant excludes `backup_time` for `authenticated`; admins read via SECURITY DEFINER RPC. |

#### ✅ ADM-11 — Middleware is role-blind (auth only) — **FIXED**

| | |
| --- | --- |
| **Area** | Default-deny / admin lockdown |
| **Where** | `middleware.ts` |
| **Problem** | Viewers hitting `/admin` got HTML then layout redirect. |
| **Fix applied** | After session refresh, middleware calls `get_staff_shell` and redirects wrong roles early; layouts remain the source of truth. |

#### ✅ ADM-12 — `gatePageData` loads data in parallel with auth — **FIXED**

| | |
| --- | --- |
| **Area** | Authorization hygiene |
| **Where** | `lib/admin/admin-list-query.ts` |
| **Problem** | Query could run even when access would be denied. |
| **Fix applied** | Await `canAccess()` first; skip `createClient`/`load` on forbidden. |

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

1. ~~Whether PostgREST silently caps export row counts (~1000) vs a true full-table dump.~~ **App now enforces `EXPORT_MAX_ROWS = 5000`.**
2. Whether any admin TipTap preview path renders HTML without going through `sanitizeBlogHtml`.
3. Whether any production staff accounts already use password `password` — rotate if so (ADM-01).

---

## Priority remediation order

1. **ADM-01** — Kill default `"password"`; harden create-user passwords. *(still open)*  
2. ✅ ~~**ADM-02 / ADM-06** — Lock down editor peer email change and peer delete.~~  
3. ✅ ~~**ADM-03** — Restore `/admin/performance` UI (stop self-redirect).~~  
4. ✅ ~~**ADM-04 / ADM-05 / ADM-09** — Harden CSV export + staff mutation rate limits.~~  
5. ✅ ~~**ADM-07 / ADM-08** — Fix `safeHref` and settings newsletter overwrite.~~  
6. ✅ ~~**ADM-10 / ADM-11 / ADM-12** — backup_time column hide, middleware role gate, sequential gatePageData.~~

---

## Suggested next step

Only **ADM-01** remains open from this audit.
