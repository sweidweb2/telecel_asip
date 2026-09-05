# Admin panel UI/UX report — ASIP / Telecel

**Date:** 5 September 2026  
**Scope:** CMS under `app/(dashboard)/` + shared chrome in `components/dashboard/`  
**Method:** Read-only. No code changed.  
**Related:** `Docs/[02] Reports/[2.2] Project Reports/27-8-2026 full project scan report.md`

---

## Verdict

| Question | Answer |
| --- | --- |
| Consistent across all pages? | **No** |
| Worth improving? | **Yes** — shared shells exist; not every page uses them the same way |
| Blocking ship? | Only **Phase 0** (blank nav pages). Rest is polish / consistency |

**Already good:** sidebar + header; `AdminListPageShell` / `AdminDataTable` / `AdminFilterBar` / delete dialogs on most finished lists; breadcrumbs on detail routes.

---

## How to use this doc

Each item is one problem. Columns:

- **Fix?** — recommended decision
- **Effort** — S / M / L
- **Phase** — do in this order

Skip anything marked **Later / optional** unless you care about polish.

---

## Phase 0 — Fix before demos (trust / broken feel)

Blank screens and wrong titles make the CMS feel unfinished.

| ID | Problem | Where | Fix? | Effort | Suggested fix |
| --- | --- | --- | --- | --- | --- |
| P0.1 | Nav goes to empty pages | Dashboard home, Analytics, Backup | **Yes** | S | Hide from nav, or show “Coming soon”, or build a minimal home |
| P0.2 | Header always says “Dashboard” on nested routes | `/blogs/new`, `/partners/[id]`, etc. | **Yes** | S | Title from parent resource; highlight parent in sidebar (`startsWith`, not exact path) |

**Decision checklist**

- [x] P0.1 — blank nav destinations *(done: Analytics/Backup removed from nav + Coming soon pages; Dashboard home has quick links)*  
- [x] P0.2 — header title + sidebar active on nested routes *(done: `isDashboardNavActive` + prefix title match)*  

---

## Phase 1 — One mental model (biggest consistency win)

Admins currently learn 3–4 different ways to list / create / edit. Pick one rule and apply it.

### Rule to adopt (recommended)

| Action | Rule |
| --- | --- |
| **List** | Always table + `AdminFilterBar` + `AdminPagination` (cards only if you explicitly want a “gallery” — then use it everywhere for that type) |
| **New** | Always in the **page header** |
| **Open** | Row click → canonical record (detail or editor) |
| **Edit** | Same surface as open (pencil does not mean something different) |
| **Short forms** | Dialog OK (e.g. create user) |
| **Long / file forms** | Full page (blogs, portfolio, multi-field CMS) |

### Problems

| ID | Problem | Examples | Fix? | Effort |
| --- | --- | --- | --- | --- |
| P1.1 | Three list UIs | Tables (most) · Cards (Blogs, Portfolio) · Hybrid (Cohorts) | **Yes** | M–L |
| P1.2 | “New” in two places | Header vs next to search | **Yes** | S |
| P1.3 | Four edit patterns | Full page · list dialog · detail then dialog · eye-only dialog | **Yes** | L |
| P1.4 | Row click inconsistent | Some rows clickable, some only icons/links | **Yes** | M |
| P1.5 | Long forms in modals | Partners, Events, Evidence, Impact | **Yes** (prefer full page) | M |

**Decision checklist**

- [x] P1.1 — unify list pattern *(Blogs / Portfolio / Cohorts → `AdminDataTable` + shared filters/pagination)*  
- [x] P1.2 — all “New” in header *(Blogs / Portfolio / Cohorts / Founder stories; dialog creates stay in header for Users / Partners / Events / Evidence / Impact)*  
- [x] P1.3 — one edit pattern per record type *(full-page editors for Blogs/Portfolio/Cohorts/Founder stories; detail→dialog for Partners/Events/Evidence/Impact; short dialogs for Users; view dialogs for inbox)*  
- [x] P1.4 — row click = open *(all list tables: row opens the same surface as the primary action)*  
- [x] P1.5 — heavy creates/edits on full pages *(done for Blogs/Portfolio/Cohorts/Founder stories; Partners/Events/Evidence/Impact still create/edit via dialogs on header/detail — full-page forms deferred)*  

---

## Phase 2 — Navigation & structure

| ID | Problem | Fix? | Effort | Suggested fix |
| --- | --- | --- | --- | --- |
| P2.1 | Flat sidebar: 16 “Manage X” items | **Yes** | S–M | Group: Pipeline · Content · Programme · System. Drop “Manage” prefix |
| P2.2 | Account shown twice (sidebar footer + header) | Optional | S | Keep header only (or sidebar only) |
| P2.3 | Duplicate titles (header + page `h2` + breadcrumbs) | **Yes** with P0.2 | S | One primary title; breadcrumbs or header, not both screaming |

**Decision checklist**

- [x] P2.1 — sidebar groups + shorter labels *(Overview / Pipeline / Content / Programme / System; dropped “Manage”)*  
- [x] P2.2 — single account chrome *(header avatar menu only; sidebar footer removed)*  
- [x] P2.3 — one title hierarchy *(header `h1` is primary; list pages no longer render a duplicate `h2`)*  

---

## Phase 3 — List polish (same filters / empty / loading)

| ID | Problem | Where | Fix? | Effort |
| --- | --- | --- | --- | --- |
| P3.1 | Empty states differ | Cards: Create CTA · Tables: “try filters” only | **Yes** | S |
| P3.2 | No Clear on card lists | Blogs, Portfolio, Cohorts | **Yes** | S |
| P3.3 | Loading feedback differs | Contact full overlay vs search spinner elsewhere | **Yes** | S |
| P3.4 | Mixed search behaviour | Users/Apps/Regs: client filter current page; others: URL only | Prefer URL-only | S–M |
| P3.5 | Stats only on Users | Users page | Optional | S |

**Decision checklist**

- [x] P3.1 — shared empty state (+ Create when create exists) *(`AdminEmptyState`; link CTAs on Blogs/Portfolio/Cohorts/Founder stories)*  
- [x] P3.2 — Clear on all filtered lists *(already on `AdminFilterBar`; card lists removed in Phase 1)*  
- [x] P3.3 — one pending pattern *(Contact overlay removed; search-field spinner only)*  
- [x] P3.4 — one search model *(Users/Apps/Regs URL-only; client page filter removed)*  
- [x] P3.5 — stats cards: keep Users-only  

---

## Phase 4 — Microcopy & chrome (nice to have)

| ID | Problem | Fix? | Effort |
| --- | --- | --- | --- |
| P4.1 | Date formats mix (`MMM d, yyyy` / `d MMM yyyy` / `d MMMM yyyy`) | Optional | S |
| P4.2 | Status badges: raw `draft` vs label `Published` | Optional | S |
| P4.3 | Settings page not using `AdminListPageShell` | Optional | S |
| P4.4 | Row action icons ~28px (below ~44px touch target) | Optional (mobile admins) | S |

**Decision checklist**

- [x] P4.1 — one date format *(`formatAdminDate` / `formatAdminDateTime` → `MMM d, yyyy` / `MMM d, yyyy · HH:mm`)*  
- [x] P4.2 — labelled statuses everywhere *(publish + quote permission labels on founder stories; other lists already labelled)*  
- [x] P4.3 — Settings shell *(done in Phase 2 via `AdminListPageShell`)*  
- [x] P4.4 — touch targets on row actions *(`size="icon"` + `min-h-11 min-w-11`)*  

---

## Phase 5 — Product (not just UI consistency)

| ID | Problem | Fix? | Effort | Notes |
| --- | --- | --- | --- | --- |
| P5.1 | Applications / Registrations / Contact = view + delete only | Product call | L | No read/unread, status, or triage |
| P5.2 | Analytics / Backup still missing | Product call | L | Tied to P0.1 — hide until real |

**Decision checklist**

- [ ] P5.1 — inbox triage features?  
- [ ] P5.2 — build Analytics/Backup or keep hidden  

---

## Quick priority map

```
Phase 0  →  Must feel finished (blank pages, wrong header)
Phase 1  →  One way to list / create / edit
Phase 2  →  Sidebar & titles easier to scan
Phase 3  →  Filters / empty / loading match
Phase 4  →  Dates, badges, touch targets
Phase 5  →  New product features (inbox, analytics)
```

| If you only have… | Do this |
| --- | --- |
| 1–2 hours | P0.1, P0.2, P1.2 |
| Half day | + P2.1, P3.1, P3.2 |
| Full consistency pass | Phase 0 → 1 → 2 → 3 |
| Later | Phase 4–5 |

---

## Reference — current patterns by page

| Page | List UI | New | Open / edit |
| --- | --- | --- | --- |
| Users | Table | Header dialog | Row / pencil → edit dialog |
| Registrations | Table | — | Row / eye → view dialog |
| Applications | Table | — | Row / eye → view dialog |
| Contact | Table | — | Row / eye → view dialog |
| Partners | Table | Header dialog | Row / pencil → detail; edit dialog on detail |
| Events | Table | Header dialog | Row / pencil → detail; edit dialog on detail |
| Evidence | Table | Header dialog | Row / pencil → detail; edit dialog on detail |
| Impact metrics | Table | Header dialog | Row / pencil → detail; edit dialog on detail |
| Founder stories | Table | Header → page | Row / pencil → full editor |
| Blogs | Table | Header → page | Row / pencil → full editor |
| Portfolio | Table | Header → page | Row / pencil → full editor |
| Cohorts | Table | Header → page | Row / pencil → full editor |
| Settings | Custom form | — | Inline form |
| Dashboard | Quick links | — | — |
| Analytics / Backup | Coming soon (not in nav) | — | — |
