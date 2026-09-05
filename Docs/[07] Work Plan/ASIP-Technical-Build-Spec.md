# ASIP Website — Technical Build Spec & Admin Panel Requirements

**Supplement to:** ASIP - Website - Text Pack & Sitemap (Revisited 24.08.2026)
**Status:** Working technical spec, derived from text pack + Guy Bitar's clarifications
**Owner:** Ali (project coordination) • **Supplier:** Mahdi Ezzedine
**Application toggle owner:** Alix (primary), nominated Telecel CMS admins (secondary)

---

## 1. Foundation Decisions

- **CMS**: Needs a real content-type/field builder so Telecel can maintain the site without vendor lock-in (per Section 16 of text pack). Options: WordPress, Webflow CMS, or headless (Sanity/Strapi + frontend). Mahdi to confirm choice at kickoff.
- **Multilingual readiness**: Structure must be French-ready (locale/language field built in), but only English content populated in Phase 1.
- **URL/redirect strategy**: Clean URLs required, plus redirects from legacy site.

---

## 2. Register Interest vs. Apply — Locked Logic

**Core principle (confirmed by Guy):** One template, two controlled states, driven by a single toggle.

> **Closed = Register Interest** | **Open = Full Apply form**

Both states/templates must be built now so Apply can be activated later with **zero redevelopment**.

### 2.1 Field Matrix (confirmed)

| Field | Register Interest (Closed) | Apply (Open) |
|---|---|---|
| Founder name | ✅ | ✅ |
| Role | ✅ | ✅ |
| Email | ✅ | ✅ |
| Phone/WhatsApp | ✅ | ✅ |
| Country | ✅ | ✅ |
| LinkedIn | ✅ (optional) | ✅ |
| Startup/company name | ✅ | ✅ |
| Website | ✅ (optional) | ✅ |
| Company country | ✅ | ✅ |
| Sector | ✅ | ✅ |
| Privacy consent | ✅ | ✅ |
| Communications opt-in | ✅ | ✅ |
| Problem & product (detailed) | ❌ | ✅ |
| Traction (users, revenue, funding, pilots) | ❌ | ✅ |
| Programme fit (growth needs, why ASIP now) | ❌ | ✅ |

### 2.2 Data Handling

- Register Interest submissions → separate **Leads** content type (notification list only).
- Apply submissions → separate **Applications** content type (full pipeline).
- **No automatic conversion or migration** from Lead to Application. When applications open, leads are manually invited to complete a fresh Apply submission.

### 2.3 Toggle Mechanics

- Single manual field: `application_status` = `closed` / `open`.
- **No scheduled auto-open** functionality required at this stage.
- Only nominated Telecel CMS admins can flip it; **Alix is primary operational owner**.
- Developer changes status only upon **written Telecel instruction** — never independently.
- Toggle drives: hero copy, CTA label/destination, form fields shown, and submission routing (Lead vs Application content type).

### 2.4 Outstanding Question (not yet answered by Guy)

- Does `/apply/` appear in primary nav only when open, and does `/register-interest/` disappear from nav once Apply activates, or do both coexist? — **Confirm before nav templates are locked.**

---

## 3. CMS Content Types (Data Model)

| Content Type | Key Fields |
|---|---|
| **Founder/Startup** | Name, company, country, sector, cohort/year, status (active/acquired/pivoted/closed/unverified), website/social links, one-line proposition, media (2–5 images + optional video) |
| **Founder Story** (linked to Founder) | Problem (60–90 words), what they built, ASIP connection, current outcome, founder quote (name, title, date, **permission checkbox**) |
| **Cohort/Year** | Year, public label, programme dates/status, partners, selected founders, summary, related events, media |
| **Impact Metric** | Claim, value, unit, period, geography, source, methodology, owner, last verified date, permission status, review date |
| **Partner/Mentor** | Name, organisation, type (corporate/investor/tech/development/mentor/media), role/contribution, active/historical status, logo permission checkbox, link |
| **Article/Case Study** | Title, author, date, category, related founder/cohort (relational), sources, media, SEO fields |
| **Event** | Name, date, location, format, speakers, founder participants, assets, outcomes |
| **Lead** (Register Interest submissions) | Per field matrix §2.1 — read-only submissions table, export/CRM sync |
| **Application** (Apply submissions) | Per field matrix §2.1 — separate submissions table, exportable to ATS |

**Global config**: `application_status` toggle (open/closed) — drives homepage banner, nav, and form rendering.

---

## 4. Page Templates

| Page | Type | Notes |
|---|---|---|
| Home | Dynamic | Hero, impact strip (pulls Impact Metric), platform model, founder spotlight (pulls Founder), impact module, ecosystem, Telecel module, 2026 CTA, latest insights (pulls Article) |
| About | Static + module | CEO/Founder message module built but hidden until approved |
| Programme | Mostly static | Cohort-conditional CTA |
| Founders | Dynamic | Directory/listing with filters (cohort, sector, country, status, outcome, search) + dynamic profile template per Founder |
| Impact | Static + dynamic | Framing copy + case study template (dynamic per founder) |
| Partners | Mostly static | — |
| Alumni | Built, hidden | Draft status in CMS; publish only on formal approval |
| Insights | Dynamic | Listing page + article template |
| Register Interest / Apply | Toggle-driven | One template, two states (see §2) |
| Contact | Form | Routes: founder/partner/media/general enquiry |
| FAQ | Static | Editable accordion content via CMS |

---

## 5. Build Sequence (Dependency Order)

1. CMS setup + content-type schema (§3)
2. Global elements: header, footer, nav (with conditional Alumni/Apply logic), status banner component
3. Homepage (depends on Impact Metric + Founder content types existing first)
4. Founders directory + profile template (core proof asset — data-heavy, prioritize early)
5. Static-ish pages: About, Programme, Partners, FAQ, Contact
6. Impact page + case study template
7. Insights listing + article template
8. Register Interest/Apply toggle system + form routing to Lead/Application content types
9. Alumni page (built, hidden)
10. SEO metadata fields per page + analytics wiring
11. Responsive/mobile pass across all templates
12. QA: forms submit and route correctly, no broken links, no placeholder text live

---

## 6. Risk Map — What Blocks What

- **Founders page & Impact page**: blocked on data, not code. VERIFY items (metrics, testimonials, permissions) must resolve in parallel with dev, or ship with placeholder-safe "coming soon" states instead of fake numbers.
- **CEO message & Alumni activation**: content-blocked, not dev-blocked. Dev builds the module/page; Telecel supplies/approves content later.
- **Apply activation**: toggle-blocked, not dev-blocked. Logic already resolved (§2).

---

## 7. Admin Panel Requirements

### 7.1 Global Site Controls

| Control | Purpose |
|---|---|
| Application status toggle | Closed (Register Interest) / Open (Apply) — drives banner, hero, form, nav |
| Alumni page visibility toggle | Hidden / Published |
| CEO/Founder message module | Hidden / Published + content fields (text, image/video) |
| User roles/permissions | Nominated admins with edit rights; Alix = primary owner of application toggle |

### 7.2 Content Type Editors

Full CRUD interface for each type in §3 (Founder/Startup, Founder Story, Cohort/Year, Impact Metric, Partner/Mentor, Article/Case Study, Event, Lead, Application).

### 7.3 Evidence/Governance Layer

Sub-panel attached to every Impact Metric and founder claim:

| Field | Type |
|---|---|
| Evidence ID | Auto-generated |
| Primary source | Text/upload |
| Measurement period | Date range |
| Owner | Admin user reference |
| Status | Dropdown: verified / pending / outdated / disputed / not for publication |
| Last verified | Date |
| Permission | Dropdown: public / internal only / partner approval required / legal review required |
| Review date | Date (flag when overdue) |

**Publish gate**: any metric/claim with status ≠ "verified" must not render on the live site — enforced as a system condition, not a manual reminder.

### 7.4 Navigation Manager

- Primary nav items (per-item visibility toggle — governs Alumni/Apply auto-appearance)
- Footer links
- Utility nav (Contact/FAQ/Privacy/Terms/Telecel Group/social)

### 7.5 Global Content Blocks

- Header banner (status-driven copy blocks)
- Footer proposition text + links
- Site-wide SEO defaults / social sharing fallback image

### 7.6 Forms Manager

- Register Interest form → routes to Lead
- Apply form → routes to Application
- Contact form → routes by enquiry type (founder/partner/media/general)
- Newsletter/updates signup — own on/off toggle, activate only once privacy/routing/owner confirmed

### 7.7 Founders Directory Filter Config

Editable taxonomies (no dev ticket needed to update):

- Cohort list (2019, 2021, 2022, 2023, 2024, 2025 Portfolio Support Year, 2026 Next Chapter)
- Sector list (FinTech, HealthTech, AgriTech, EdTech, InsurTech, CleanTech, eCommerce, Logistics, Mobility, Enterprise Technology, Other)
- Status values (active/acquired/pivoted/closed/unverified)
- Outcome tags (funding/pilot/partnership/expansion/jobs/award/acquisition)

---

## 8. Open Items Requiring Guy's Confirmation

1. Nav coexistence: does `/register-interest/` disappear once `/apply/` activates, or do both remain live simultaneously?

---

*This document consolidates all technical/logic decisions made outside the original text pack. It does not replace Section 13 or Section 16 of the master text pack — it operationalizes them for the developer.*
