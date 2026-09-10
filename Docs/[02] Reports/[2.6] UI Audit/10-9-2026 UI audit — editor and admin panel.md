# UI audit — Editor panel and Admin panel

**Date:** 10 September 2026  
**Scope:** Staff shells only — Editor (`/dashboard/*`) and Admin (`/admin/*`). Marketing, auth, and public pages are out of scope.  
**Method:** The 100 prompts in `Docs/[10] Skills/ui-audit.md` applied as a read-only checklist against live code.  
**Progress:** ✅ = fixed in code. Unmarked items are still open.  
**Related:** `Docs/[02] Reports/[2.3] Admin panel ui-ux/5-9-2026 Admin panel ui-ux report.md` (older, pre staff-split; still useful for list/editor patterns).

---

## 1. How to read this

This is a **problems report**, not a polish loop. Each finding is something that is wrong, missing, or confusing on the editor or admin shell today.

| Severity | Meaning |
| --- | --- |
| **High** | Broken, misleading, or unsafe for daily staff use |
| **Medium** | Real UX/a11y gap that staff will hit often |
| **Low** | Polish / consistency; not blocking |

Surfaces:

- **Shared shell** — sidebar, header, list chrome, tables, toasts (both roles)
- **Admin panel** — `/admin` (Users, Settings, Performance, Backup)
- **Editor panel** — `/dashboard` (CMS, inbox, analytics, settings)

---

## 2. Executive summary

The two shells are split correctly (admin is redirected away from `/dashboard`, editor cannot stay on `/admin`). Shared list chrome, delete confirms, and the fixed editor save bar are in good shape.

The problems that matter most:

1. ✅ ~~**`/admin/performance` never loads** — the page redirects to itself.~~ Restored (`AdminPerfDashboard` mounted).  
2. ✅ ~~**Editor create/edit forms can lose work**~~ — `useUnsavedChangesGuard` on all CMS editors (`beforeunload`, link click, back).
3. ✅ ~~**Dummy / Clear buttons ship in production**~~ — gated to non-production in `AdminFormDevTools`.
4. ✅ ~~**Empty lists and filtered no-results use the same copy**~~ — `AdminEmptyState` splits empty vs no-results; create CTAs only on true empty.
5. ✅ ~~**Browser tabs still say “ASIP Admin”**~~ — editor dashboard document titles use `| ASIP Editor`.
6. ✅ ~~**No skip-to-content / nested mains / mouse-only rows**~~ — skip link, single `<main>` (`StaffMain`), `AdminClickableRow` (keyboard).

---

## 3. Shared shell (both panels)

These sit in `components/dashboard/` and `components/ui/sidebar.tsx` and affect every staff page.

### High

1. ✅ **No skip-to-content link** — **done.**  
   `SkipToContent` is mounted in both `app/(unlocalized)/(admin)/layout.tsx` and `(dashboard)/layout.tsx`.  
   *Prompt 55.*

2. ✅ **Nested `<main>` landmarks** — **done.**  
   `SidebarInset` is a layout `<div>`; page content uses `StaffMain` / `AdminListPageShell` as the single landmark.  
   *Prompt 49.*

3. ✅ **Table rows open only on click** — **done.**  
   `AdminClickableRow` (`role="button"`, Enter/Space, focus ring) on CMS/inbox/users/perf tables.  
   *Prompts 46, 95.*

4. ✅ **Empty vs no-results is the same message** — **done.**  
   `AdminEmptyState` + `adminListFiltersActive`; true-empty vs filtered no-results copy; create CTA only when not filtered.  
   *Prompt 8.*

### Medium

5. ✅ **Header is not sticky** — **done.**  
   `StaffHeader` is `sticky top-0` with backdrop blur.  
   *Prompt 17.*

6. ✅ **Header page search is a small typeahead, not a command palette** — **done.**  
   ⌘K / Ctrl+K, `min-h-11` touch target, editor Actions (“New blog”, etc.) via `DASHBOARD_COMMAND_PAGES`. Record search still not in scope.  
   *Prompts 14, 88, 91.*

7. ✅ **Sidebar trigger is too small** — **done.**  
   `min-h-11 min-w-11` on mobile.  
   *Prompt 14.*

8. ✅ **Double horizontal scroll on tables** — **done.**  
   Single scroll region in `AdminDataTable` (no nested overflow).  
   *Prompts 12, 95.*

9. ✅ **No column sort, sticky thead, bulk select, or list export** — **partially done.**  
   Sticky thead ✅; URL `sort`/`dir` on Users + Blogs ✅; Users CSV (`/api/admin/export/profiles`) ✅. **Bulk select still open.**  
   *Prompts 95–100.*

10. ✅ **Loading skeletons do not match the live shell** — **done.**  
    Fake in-page titles removed; Backup/Settings/Performance use `RouteSkeleton` + `StaffPageSkeleton`.  
    *Prompt 35.*

11. ✅ **No `prefers-reduced-motion` on staff chrome** — **done.**  
    Sidebar transitions, `MotionSafeTopLoader`, row hover, spinners.  
    *Prompt 51.*

12. ✅ **No offline / network-failure UI** — **done.**  
    `StaffOfflineBanner` in both staff layouts.  
    *Prompt 82.*

13. ✅ **No undo** — **done.**  
    `toastWithUndo` on publish toggles, partner flags, inbox archive.  
    *Prompt 81.*

14. ✅ **Hardcoded / non-semantic colors** — **done.**  
    Destructive/brand/chart tokens; editor `bg-white dark:bg-card` removed.  
    *Prompts 1–2, 54.*

### Low

15. ✅ **Only keyboard shortcut is Ctrl/⌘+B** — **done.**  
    `StaffKeyboardShortcuts`: `?` help, ⌘/Ctrl+S save, `N` new item (plus documented ⌘K / ⌘B).  
    *Prompts 88, 93.*

16. ✅ **Shared components still named “Dashboard”** — **done.**  
    `StaffHeader`, `StaffPageSearch`, `StaffPageSkeleton`, `lib/admin/staff-page-search.ts`.  
    *Prompt 30.*

17. ✅ **Nav count badges use `text-[10px]`** — **done.**  
    Now `text-xs`.  
    *Prompt 21.*

18. ✅ **Filter pending / table pending not announced** — **done.**  
    `AdminFilterBar` polite live region (“Updating results…” / “Results updated”) + `aria-busy`.  
    *Prompt 52.*

---

## 4. Admin panel (`/admin`)

Chrome: `app/(unlocalized)/(admin)/layout.tsx` — sidebar brand **Admin panel**, nav = Overview, Users, Settings, Performance, Backup.

### High

19. ✅ **Performance page is a self-redirect (broken)** — **done.**  
    `/admin/performance` mounts `AdminPerfDashboard` again. Dashboard bookmark still redirects to admin.  
    *Prompts 78, 87.*

20. ✅ **Backup copy points schedule to Settings — schedule lives on Backup** — **done.**  
    Create-form copy points at the schedule section on this page.  
    *Prompts 68, 85, 87.*

21. ✅ **Users empty state never offers Create / conflates empty vs no-results** — **done** (shared empty-state work).  
    True-empty copy points to header create; filtered no-results is separate.  
    *Prompt 8.*

### Medium

22. ✅ **No admin home** — **done.**  
    `/admin` is Overview with quick links (Users, Settings, Performance, Backup).  
    *Prompts 6, 87.*

23. ✅ **“Applications open” is owned twice** — **done.**  
    Toggle lives on Settings only; Backup keeps schedule UI (hidden defaults for save).  
    *Prompts 10, 87, 94.*

24. ✅ **New-user password UX is weak** — **done.**  
    Strong password required; show/hide on create; no default `"password"`.  
    *Prompts 74, 68.*

25. ✅ **Backup page has four peer blocks** — **done.**  
    Order: Create → Schedule → History → Recovery (muted); Create “Starting…” has spinner.  
    *Prompts 6, 76, 83.*

26. ✅ **Backup history table** — **done.**  
    Status/scope filters, sortable columns, title-case status badges, `formatAdminDateTime`.  
    *Prompts 28, 30, 86, 95, 96.*

27. ✅ **User stats cards** — **done.**  
    Responsive grid; labels wrap on narrow widths.  
    *Prompts 11, 18.*

28. **Destructive user delete has confirm, no undo;** `DeleteOldPerfEventsButton` has **no confirm** (Performance page is reachable again ✅).  
    *Prompt 80.*

29. ✅ **Admin Backup/Settings/Performance loading is generic** — **done.**  
    Those routes use `RouteSkeleton` + `StaffPageSkeleton`.  
    *Prompt 35.*

### Low

30. ✅ **Header title on `/admin` falls back to “Admin”** — **done.**  
    Overview is a nav item; title resolves correctly.  
31. ✅ **Newsletter on Settings** — **done.**  
    Phase-1 informational callout (not a fake switch).  
    *Prompt 85.*

---

## 5. Editor panel (`/dashboard`)

Chrome: `app/(unlocalized)/(dashboard)/layout.tsx` — sidebar brand **Editor panel**. Admins are redirected to `/admin`. Backup/Performance URLs still exist as redirects to admin (correct).

### High

32. ✅ **No unsaved-changes protection** — **done.**  
    `useUnsavedChangesGuard` on all eight `*-editor-form.tsx` (refresh, same-origin links, best-effort back).  
    *Prompts 71, 80, 94.*

33. ✅ **Dummy / Clear is always visible in production** — **done.**  
    `AdminFormDevTools` returns `null` when `NODE_ENV === "production"`.  
    *Prompts 75, 94.*

34. ✅ **Document titles say “ASIP Admin” on editor work** — **done.**  
    Editor dashboard pages use `| ASIP Editor` (home, settings, analytics, create/edit).  
    *Prompts 30, 56.*

35. ✅ **Competing headings on create/edit** — **done.**  
    `getDashboardPageTitle` uses New/Edit action titles; forms no longer render a duplicate `<h2>`.  
    *Prompts 6, 26.*

36. ✅ **Rich text editor a11y** — **done.**  
    Toolbar `role="toolbar"`, labelled contenteditable, link Dialog instead of `window.prompt`.  
    *Prompts 46, 48, 53.*

### Medium

37. **Editor home is an incomplete launcher**  
    Nine tiles; sidebar also has Events, Evidence, Impact, Newsletter, Analytics, Cohorts. Home does not match IA. Label “Startup” vs route `portfolio` is slightly opaque. No stats / “what’s waiting”.  
    File: `app/(unlocalized)/(dashboard)/dashboard/page.tsx`.  
    *Prompts 6, 87.*

38. **Edit/new `loading.tsx` reuses list skeletons**  
    Example: `dashboard/blogs/[id]/loading.tsx` → `BlogsPageSkeleton` (table shape) instead of a long form + save bar. Same pattern on cohorts, events, partners, etc.  
    *Prompt 35.*

39. **Startup stepper does not gate steps**  
    All steps `forceMount`; Save is available from any step; errors elsewhere are easy to miss.  
    File: `components/startups/startup-editor-form.tsx`.  
    *Prompt 72.*

40. **Image upload progress is toast-only**  
    “Uploading image…” spinner, no percent, no cancel. Create can succeed then fail mid-upload.  
    *Prompts 76, 83.*

41. **Settings exist in both shells**  
    Editors have `/dashboard/settings`; admins have `/admin/settings`. Same `SettingsPageContent`. Fine if both roles may flip Applications; easy to think they are different products.  
    *Prompts 10, 87.*

42. **Users live in the editor System nav**  
    Editors can create other editors/viewers. Not a leftover admin link, but it is a powerful System item sitting next to Analytics. Confirm this is intended.  
    *Prompt 87.*

43. **Form field errors are inconsistent**  
    Some fields use FieldError / `aria-invalid`; many editors use a plain `<p className="text-destructive">` with no `role="alert"` / `aria-describedby`.  
    *Prompts 48, 67, 68.*

44. **Section help info buttons are `size-8`** — tight for thumbs.  
    File: `components/dashboard/admin-form-section-help.tsx`.  
    *Prompt 14.*

45. **Featured naming drifts** — list badge “Hero” vs form “Featured hero” (`blogs-table.tsx` vs `blog-editor-form.tsx`). *Prompt 30.*

46. **Portfolio edit breadcrumb does not truncate**; other editors use `max-w-[16rem] truncate`. Long startup names can blow the crumb row.  
    *Prompt 27.*

### Low

47. **Group `(dashboard)/loading.tsx` can flash a fake sidebar** while the real layout already mounted the shell. *Prompt 15.*  
48. **No nested `error.tsx` / `not-found.tsx`** under dashboard — one group boundary for every CMS page. *Prompt 79.*  
49. **Redirect stubs** `/dashboard/backup` and `/dashboard/performance` still have `loading.tsx` that can flash before redirect. *Prompt 94.*  
50. **No drag-and-drop reorder** for partners (`sortOrder` is a number). Not required; prompt 64 is N/A unless you want visual reorder.

---

## 6. Prompt map — where this codebase has a problem

Only prompts that produced a real finding on editor/admin. The rest are OK or N/A for this staff UI (called out at the bottom).

### Design system (1–10)

| # | Prompt | Problem |
| --- | --- | --- |
| 1–2 | Tokens / semantic color | ✅ Semantic tokens / no `bg-white` on editor fields |
| 6 | Hierarchy | Header h1 vs form h2; admin has no home; editor home incomplete |
| 8 | Empty states | ✅ Empty vs no-results split |
| 10 | Consistency | “ASIP Admin” vs “Editor panel”; Dummy in prod; Backup vs Settings copy |

### Layout & responsive (11–20)

| # | Prompt | Problem |
| --- | --- | --- |
| 11 | Breakpoints | User stats cards squeeze on phone |
| 12 | Horizontal scroll | ✅ Single table scroll region |
| 14 | Touch targets | ✅ Sidebar trigger + header search; section-help icon still tight |
| 15 | Layout shift | ✅ List/generic skeletons match header-owned titles; edit-route skeletons still list-shaped |
| 17 | Sticky header | ✅ Sticky `StaffHeader` |
| 18 | Density | Backup `gap-10` vs lists `gap-6`; admin page is four equal blocks |

### Typography (21–30)

| # | Prompt | Problem |
| --- | --- | --- |
| 21 | Type scale | ✅ Nav badges `text-xs`; other one-offs may remain |
| 26 | Heading structure | ✅ Nested mains fixed; header h1 still not create/edit title |
| 27 | Overflow | Some emails/names truncate without tooltip; portfolio crumb |
| 28 | Dates | Backup history vs Users date formatting |
| 30 | Casing / labels | ✅ Staff chrome renamed; Hero vs Featured / ASIP Admin titles still open |

### Performance (31–44) — UI-facing only

| # | Prompt | Problem |
| --- | --- | --- |
| 35 | Skeletons | ✅ Staff list/admin loadings fixed; edit routes still list-shaped |
| 39 | Optimistic UI | ✅ Undo toast on toggles/archive |
| 41 | Debounce | ✅ ⌘K + Actions catalog (not full record search) |

### Accessibility (45–56)

| # | Prompt | Problem |
| --- | --- | --- |
| 45–46 | Keyboard | ✅ Row keyboard + skip link; RTE prompt still open |
| 47 | Focus | ✅ Clickable rows have focus-visible ring |
| 48 | Forms | Error association incomplete; password create field |
| 49 | Semantics | ✅ Single `<main>` |
| 51 | Reduced motion | ✅ Staff chrome respects it |
| 52 | Live regions | ✅ Filter pending announced |
| 53 | Modals | Delete dialogs OK; RTE `window.prompt` is not a dialog |
| 54 | Color alone | ✅ Perf cache badges labeled + semantic |
| 55 | Skip link | ✅ Present in staff layouts |
| 56 | Titles / lang | Editor routes titled “ASIP Admin”; `lang` itself is OK (`en`) |

### Motion (57–66)

| # | Prompt | Problem |
| --- | --- | --- |
| 58 | Motion tokens | ✅ Reduced-motion on sidebar / toploader |
| 61 | Hover/focus | ✅ Rows keyboard-operable |
| 63 | Loading→content | ✅ List skeletons improved; edit-route mismatch remains |
| 64 | Drag affordances | N/A (no DnD) |

### Forms (67–76)

| # | Prompt | Problem |
| --- | --- | --- |
| 67–68 | Validation / errors | Timing OK; copy/association incomplete; Backup “Settings” lie |
| 71 | Autosave | None; no dirty-leave warning |
| 72 | Multi-step | Startup stepper does not validate per step |
| 74 | Password | Create-user default `"password"`, no visibility toggle |
| 75 | Hints | Dummy tools look like real editor actions |
| 76 | Submit feedback | Create backup “Starting…” has no spinner |

### Feedback (77–86)

| # | Prompt | Problem |
| --- | --- | --- |
| 78 | Four states | ✅ Empty vs no-results; ✅ Performance view mounts |
| 79 | Error boundaries | Group-level only |
| 80 | Destructive confirm | Users OK; perf delete reachable again but still no confirm |
| 81 | Undo | ✅ Toast undo on toggles/archive |
| 82 | Offline | ✅ Staff offline banner |
| 83 | Long ops | Uploads and some backup actions lack determinate progress |
| 85 | Contextual help | Newsletter “phase 1” dead block; Dummy unlabeled as dev-only |
| 86 | Status system | Backup raw enums; Hero vs Featured |

### Navigation (87–94)

| # | Prompt | Problem |
| --- | --- | --- |
| 87 | Primary nav | ✅ Performance reachable; home tiles ≠ sidebar; Settings in two shells |
| 88 | Command palette | ✅ ⌘K page/actions search (not full record palette) |
| 89 | Active location | Header title stays on parent (“Blogs”) on `/blogs/new` |
| 90 | Breadcrumbs | Present on editors; missing on admin Backup’s inner sections |
| 91 | Search | ✅ Nav + Actions typeahead |
| 93 | Shortcuts | ✅ `?` / save / new (+ ⌘B / ⌘K) |
| 94 | Friction | Dirty leave; Dummy; password default; dual Applications toggle |

### Tables (95–100)

| # | Prompt | Problem |
| --- | --- | --- |
| 95 | Usable tables | ✅ Sticky thead, single scroll, keyboard rows; sort on Users/Blogs |
| 96 | Filter/sort | ✅ Empty/no-results split; sort on Users/Blogs |
| 97 | Pagination | Present and OK |
| 98 | Charts | ✅ Performance charts reachable on `/admin/performance` |
| 99 | Bulk | None (still open) |
| 100 | Export | ✅ Users CSV + inbox CSV; other CMS tables still no export |

### Prompts with no staff-shell problem (N/A or OK)

3–5 spacing/radius/shadow (mostly tokenized), 7 button primitive states, 9 Lucide-only icons, 13 grid on home tiles, 16 safe-area on save bar, 19 container queries, 20 z-index (save bar vs sidebar is handled), 22–25 marketing type/fonts, 32–34 / 36–38 / 40 / 42–44 bundle/images/virtualize (not this UI pass), 50 image alts on sidebar logos OK, 57/59/62/65/66 motion extras not required on an operate UI, 69–70 input masking mostly N/A, 73 selects usable, 77 toasts exist, 92 back/scroll on filter `replace` is OK.

---

## 7. Route inventory (problems only)

### Admin

| Route | Issue |
| --- | --- |
| `/admin` | ✅ Overview home + nav title |
| `/admin/users` | ✅ Empty/no-results + keyboard rows + sort/export; password required + show/hide |
| `/admin/settings` | ✅ Applications owned here; newsletter phase-1 callout |
| `/admin/performance` | ✅ Restored — mounts `AdminPerfDashboard` |
| `/admin/backup` | ✅ Schedule on-page; Create first; history filters/sort |

### Editor

| Route | Issue |
| --- | --- |
| `/dashboard` | Incomplete launcher; title `Dashboard \| ASIP Admin` |
| CMS lists | ✅ Empty/no-results + keyboard rows; sort on Users/Blogs; bulk still open |
| `/dashboard/*/new` and `[id]` | Dirty leave; Dummy in prod; `\| ASIP Admin` titles; list-shaped skeletons; heading clash |
| `/dashboard/settings` | Title `\| ASIP Admin`; duplicate of admin Settings |
| `/dashboard/users` | ✅ Same shared-table fixes as admin Users |
| `/dashboard/backup`, `/performance` | Redirects (correct) but loading chrome can flash |

---

## 8. Recommended fix order

Do these first — they are either broken or will burn staff:

1. ✅ Mount `AdminPerfDashboard` on `/admin/performance` (stop the self-redirect).
2. ✅ Gate **Dummy / Clear** to development (or a hidden flag).
3. ✅ Warn on dirty editor leave (`beforeunload` + in-app navigation).
4. ✅ Split **empty** vs **no-results** on every table.
5. ✅ Rename editor document titles to `| ASIP Editor`.
6. ✅ Fix Backup copy (“schedule is on this page”) and pick **one** owner for Applications open.
7. ✅ One `<main>` per page + skip-to-content.
8. ✅ Make row open keyboard-accessible.
9. ✅ Replace `window.prompt` in the blog editor.
10. ✅ Remove the create-user default `"password"` and add a visibility toggle.

Then polish (shared shell — largely done):

- ✅ Sticky header, matching skeletons, touch targets, sticky thead, reduced motion, ⌘K + shortcuts  
- ✅ Undo / offline / semantic colors / Staff* naming / filter live region  
- Still open: **bulk select**, sort on remaining tables, CMS CSV beyond Users/inbox  

---

## 9. What is already working

Do not “fix” these unless product asks:

- Admin vs editor layout gates and redirects  
- Sidebar groups, active states, collapsed tooltips, mobile sheet  
- `AdminListPageShell` + `AdminDataTable` + filters + pagination  
- Fixed save bar with sidebar offset and safe-area  
- Breadcrumbs on create/edit  
- Delete `AlertDialog` with named confirm  
- Dark / light / system in the account menu  
- List `loading.tsx` coverage on CMS routes  
- Toasts on save/error  
- Inbox CSV export (+ Users CSV)  
- Skip link, sticky header, keyboard rows, empty/no-results, shortcuts help  

---

*End of report. Source checklist: `Docs/[10] Skills/ui-audit.md` (prompts 1–100).*
