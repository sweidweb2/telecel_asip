# Admin panel UI/UX report — ASIP / Telecel

**Date:** 5 September 2026  
**Scope:** CMS under `app/(dashboard)/` + shared chrome in `components/dashboard/`  
**Status:** Phases 0–5 checklist complete (P1.5 full-page forms + Analytics/Backup shipped)  
**Related:** `Docs/[02] Reports/[2.2] Project Reports/27-8-2026 full project scan report.md`

---

## Verdict

| Question | Answer |
| --- | --- |
| Consistent across all pages? | **Yes** for the shared list/shell/editor pattern |
| Worth improving further? | Optional polish only (GA4/consent remains RFQ site work, not this CMS page) |
| Blocking ship? | **No** |

**Shipped pattern:** sidebar groups + header; `AdminListPageShell` / `AdminDataTable` / `AdminFilterBar` / `AdminEmptyState`; full-page editors for long CMS forms; inbox triage; Analytics KPIs; Backup CSV export.

**Consistency rescan (5 Sep 2026):** Checklist matches live code. Follow-ups applied: Evidence/Impact empty-state Create CTAs; `ROUTES.blogsNew`; removed unused `AdminComingSoon`.

---

## Phase 0 — Fix before demos

**Decision checklist**

- [x] P0.1 — blank nav destinations  
- [x] P0.2 — header title + sidebar active on nested routes  

---

## Phase 1 — One mental model

**Decision checklist**

- [x] P1.1 — unify list pattern (`AdminDataTable`)  
- [x] P1.2 — all “New” in header (links or short dialogs)  
- [x] P1.3 — one edit pattern per record type  
- [x] P1.4 — row click = open  
- [x] P1.5 — heavy creates/edits on full pages *(Partners / Events / Evidence / Impact now full-page editors like Cohorts)*  

---

## Phase 2 — Navigation & structure

**Decision checklist**

- [x] P2.1 — sidebar groups + shorter labels  
- [x] P2.2 — single account chrome  
- [x] P2.3 — one title hierarchy  

---

## Phase 3 — List polish

**Decision checklist**

- [x] P3.1 — shared empty state  
- [x] P3.2 — Clear on all filtered lists  
- [x] P3.3 — one pending pattern  
- [x] P3.4 — URL-only search  
- [x] P3.5 — stats cards Users-only  

---

## Phase 4 — Microcopy & chrome

**Decision checklist**

- [x] P4.1 — `formatAdminDate` / `formatAdminDateTime`  
- [x] P4.2 — labelled statuses  
- [x] P4.3 — Settings shell  
- [x] P4.4 — touch targets on row actions  

---

## Phase 5 — Product

**Decision checklist**

- [x] P5.1 — inbox triage (Unread / Reviewed / Archived)  
- [x] P5.2 — Analytics + Backup shipped *(in-app pipeline/content KPIs; CSV export + recovery notes; both in System nav)*  

### P5.1 — inbox triage

Schema: `inbox_status` on applications / interest_registrations / contact_messages. Default list = Inbox (excludes archived). Open marks unread→reviewed. Archive row action.

### P5.2 — Analytics & Backup

| Route | Nav | Page |
| --- | --- | --- |
| `/dashboard/analytics` | System | Pipeline + content snapshot KPIs |
| `/dashboard/backup` | System | Intake CSV downloads + recovery checklist |

CSV: `GET /api/admin/export/{applications\|interest_registrations\|contact_messages}` (admin-only).

---

## Reference — current patterns by page

| Page | List UI | New | Open / edit |
| --- | --- | --- | --- |
| Users | Table | Header dialog | Row / pencil → edit dialog |
| Registrations | Table + inbox | — | Row / eye → view; archive |
| Applications | Table + inbox | — | Row / eye → view; archive |
| Contact | Table + inbox | — | Row / eye → view; archive |
| Partners | Table | Header → page | Row / pencil → full editor |
| Events | Table | Header → page | Row / pencil → full editor |
| Evidence | Table | Header → page | Row / pencil → full editor |
| Impact metrics | Table | Header → page | Row / pencil → full editor |
| Founder stories | Table | Header → page | Row / pencil → full editor |
| Blogs | Table | Header → page | Row / pencil → full editor |
| Portfolio | Table | Header → page | Row / pencil → full editor |
| Cohorts | Table | Header → page | Row / pencil → full editor |
| Settings | Custom form | — | Inline form |
| Dashboard | Quick links | — | — |
| Analytics | KPI cards + table | — | — |
| Backup | Export + recovery | — | CSV download |
