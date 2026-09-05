# ASIP Website — CMS Database Schema

**Supplement to:** ASIP Technical Build Spec + Text Pack & Sitemap (Revisited 24.08.2026)
**Purpose:** Full table-by-table attribute list for CMS/database implementation
**Owner:** Ali (project coordination) • **Supplier:** Mahdi Ezzedine

Notes on conventions used below:
- `PK` = Primary Key, `FK` = Foreign Key (relation to another table)
- `req` = required field, `opt` = optional field
- Field types are generic (map to whatever the chosen CMS/DB supports: text, richtext, enum/select, date, boolean, number, media/file, relation)

---

## 1. `founders` (Founder / Startup)

Core directory entity — powers the Founders listing, filters, and profile pages.

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| id | PK | — | Auto-generated |
| founder_name | text | req | |
| startup_name | text | req | |
| one_line_proposition | text | req | Customer-facing value prop, used on card + hero |
| country | relation → `countries` taxonomy | req | Primary market |
| operating_countries | relation → `countries` (multi) | opt | Verified operating markets |
| sector | relation → `sectors` taxonomy | req | |
| cohort_year | relation → `cohorts` | req | |
| status | enum: active / acquired / pivoted / closed / unverified | req | Section 08 filter field |
| outcome_tags | relation → `outcome_tags` taxonomy (multi) | opt | funding/pilot/partnership/expansion/jobs/award/acquisition |
| website_url | url | opt | |
| social_links | repeatable (platform, url) | opt | |
| hero_image | media | req | Approved imagery |
| media_gallery | media (2–5 images + optional video) | req | Section 08 profile structure |
| featured_on_homepage | boolean | opt | Drives Module 04 Founder Spotlight selection |
| publish_status | enum: draft / published | req | Governance gate |
| last_updated | date (auto) | — | |

---

## 2. `founder_stories` (linked to `founders`)

One-to-one (or one-to-many if a founder gets updated stories over time) with `founders`.

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| id | PK | — | |
| founder_id | FK → `founders` | req | |
| the_problem | richtext (60–90 words) | req | Section 08 |
| what_they_built | richtext | req | |
| the_asip_connection | richtext | req | Specific support received |
| where_they_are_now | richtext | req | Validated milestones |
| founder_quote_text | text | opt | |
| quote_attribution_name | text | opt | Required if quote present |
| quote_attribution_title | text | opt | |
| quote_date | date | opt | |
| quote_permission_status | enum: granted / pending / denied | req if quote present | **Publish gate**: quote must not render unless "granted" |
| related_evidence_id | FK → `evidence_records` (multi) | opt | Links claims in this story to governance layer |
| publish_status | enum: draft / published | req | |

---

## 3. `cohorts` (Cohort / Year)

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| id | PK | — | |
| year | number | req | e.g. 2019, 2021...2026 |
| public_label | text | req | e.g. "2025 Portfolio Support Year", "2026 Next Chapter" |
| programme_dates | date range | opt | VERIFY before publish |
| programme_status | enum: closed / open / hold | req | |
| partners | relation → `partners` (multi) | opt | |
| selected_founders | relation → `founders` (multi) | opt | |
| summary | richtext | opt | |
| related_events | relation → `events` (multi) | opt | |
| media | media | opt | |
| publish_status | enum: draft / published | req | |

---

## 4. `impact_metrics` (Impact Metric)

Every homepage/Impact-page number must come from this table — never hardcoded copy.

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| id | PK | — | |
| claim_label | text | req | e.g. "Applications", "Women-led" |
| value | number/text | req | e.g. "10,000+", "70%" |
| unit | text | opt | %, count, etc. |
| period | date range | req | Measurement period |
| geography | text | opt | |
| impact_lens | enum: pipeline / inclusion / business growth / commercialisation / jobs & capability / sector outcomes | opt | Section 09 categorization |
| display_location | relation (multi) → pages/modules | opt | e.g. "Homepage Module 02", "Impact page" |
| evidence_id | FK → `evidence_records` | req | **Every metric must link to one** |
| publish_status | enum: verified / pending / outdated / disputed / not for publication | req | **Publish gate: only "verified" renders live** |

---

## 5. `evidence_records` (Governance Layer)

Standalone table referenced by `impact_metrics`, `founder_stories`, and any other claim-bearing content.

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| id | PK (Evidence ID) | — | Auto-generated |
| primary_source | text/file upload | req | |
| measurement_period | date range | req | |
| owner | relation → `admin_users` | req | Person accountable |
| status | enum: verified / pending / outdated / disputed / not for publication | req | |
| last_verified_date | date | req | |
| permission | enum: public / internal only / partner approval required / legal review required | req | |
| review_date | date | req | Should flag/alert when overdue |
| linked_content | relation (multi, polymorphic) | opt | Which metric(s)/story(ies) this evidence supports |

---

## 6. `partners` (Partner / Mentor)

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| id | PK | — | |
| name | text | req | |
| organisation | text | opt | |
| partner_type | enum: corporate / investor / tech / development / mentor / media | req | |
| role_contribution | richtext | opt | Section 10 |
| status | enum: active / historical | req | |
| logo | media | opt | |
| logo_permission_status | enum: granted / pending / denied | req if logo present | **Publish gate**: don't show logo unless "granted" |
| link_url | url | opt | |
| publish_status | enum: draft / published | req | |

---

## 7. `articles` (Article / Case Study)

Powers `/insights/` listing and article template, plus Impact page case studies.

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| id | PK | — | |
| title | text | req | |
| author | text | req | |
| publish_date | date | req | |
| category | enum: Founder Stories / Portfolio News / Programme Updates / Founder Resources / Partner Perspectives | req | Section 12 content streams |
| related_founder | FK → `founders` | opt | |
| related_cohort | FK → `cohorts` | opt | |
| body_content | richtext | req | |
| sources | repeatable text/url | opt | |
| media | media | opt | |
| meta_title | text | opt | SEO field |
| meta_description | text | opt | SEO field |
| publish_status | enum: draft / published | req | |

---

## 8. `events`

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| id | PK | — | |
| name | text | req | |
| date | date | req | |
| location | text | opt | |
| format | enum: virtual / in-person / hybrid | opt | |
| speakers | repeatable text | opt | |
| founder_participants | relation → `founders` (multi) | opt | |
| assets | media (multi) | opt | |
| outcomes | richtext | opt | |
| publish_status | enum: draft / published | req | |

---

## 9. `leads` (Register Interest submissions)

Read-only submissions table — not editable "content," but needs a data table + export.

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| id | PK | — | |
| submitted_at | datetime (auto) | — | |
| founder_name | text | req | |
| role | text | req | |
| email | text | req | |
| phone_whatsapp | text | req | |
| country | text | req | |
| linkedin_url | url | opt | |
| startup_name | text | req | |
| website_url | url | opt | |
| company_country | text | req | |
| sector | relation → `sectors` | req | |
| privacy_consent | boolean | req | Must be true to submit |
| comms_opt_in | boolean | req | |
| status | enum: new / contacted / invited to apply / archived | opt | For internal follow-up tracking |
| export_flag | boolean | opt | For CRM sync batching |

---

## 10. `applications` (Apply submissions)

Separate table from `leads` — no auto-migration between the two (per Guy's confirmation).

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| id | PK | — | |
| submitted_at | datetime (auto) | — | |
| founder_name | text | req | |
| role | text | req | |
| email | text | req | |
| phone_whatsapp | text | req | |
| country | text | req | |
| linkedin_url | url | req | |
| startup_name | text | req | |
| website_url | url | req | |
| company_country | text | req | |
| sector | relation → `sectors` | req | |
| year_founded | number | opt | |
| team_size | number | opt | |
| customer_problem | richtext | req | |
| solution_description | richtext | req | |
| technology_differentiation | richtext | req | |
| users_customers | text | opt | Traction |
| revenue | text | opt | Traction |
| pilots | richtext | opt | Traction |
| markets | text | opt | Traction |
| funding_raised | text | opt | Traction |
| top_growth_needs | richtext | req | Programme fit |
| expansion_ambition | richtext | req | Programme fit |
| why_asip_now | richtext | req | Programme fit |
| privacy_consent | boolean | req | |
| comms_opt_in | boolean | req | |
| accuracy_declaration | boolean | req | |
| pipeline_status | enum: received / eligible / under review / interview / selected / rejected | opt | Internal tracking through Section 13 journey stages |
| export_flag | boolean | opt | For ATS sync |

---

## 11. Taxonomies (editable lists, no dev ticket needed)

### `sectors`
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| label | text | FinTech, HealthTech, AgriTech, EdTech, InsurTech, CleanTech, eCommerce, Logistics, Mobility, Enterprise Technology, Other |

### `countries`
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| label | text | Standard country list; flagged as "verified" per founder record where relevant |

### `cohorts` (see table 3 above — also functions as filter taxonomy)

### `outcome_tags`
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| label | text | funding, pilot, partnership, market expansion, jobs, award, acquisition |

### `status_values` (founder status — could be hardcoded enum instead of table)
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| label | text | active, acquired, pivoted, closed, unverified |

---

## 12. `admin_users`

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| id | PK | — | |
| name | text | req | |
| email | text | req | |
| role | enum: super admin / content editor / evidence owner / toggle owner | req | |
| can_toggle_application_status | boolean | req | Only Alix + nominated admins = true |
| can_publish_alumni | boolean | opt | |
| can_publish_ceo_message | boolean | opt | |

---

## 13. `site_config` (Global Config / Singleton table)

Not a repeatable content type — one row/object holding global toggles and blocks.

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| application_status | enum: closed / open | req | Master toggle — drives Register Interest vs Apply everywhere |
| alumni_visibility | enum: hidden / published | req | |
| ceo_message_visibility | enum: hidden / published | req | |
| ceo_message_text | richtext | opt | Populated only when approved |
| ceo_message_media | media | opt | |
| newsletter_signup_enabled | boolean | req | Off by default until privacy/routing/owner confirmed |
| header_banner_closed_copy | richtext | req | "Register interest" state copy (Section 04) |
| header_banner_open_copy | richtext | req | "Apply" state copy (Section 04) |
| footer_proposition_text | richtext | req | |
| footer_links | repeatable (label, url) | req | |
| default_seo_title | text | opt | Fallback |
| default_seo_description | text | opt | Fallback |
| default_social_share_image | media | opt | Fallback |

---

## 14. `nav_items` (Navigation Manager)

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| id | PK | — | |
| label | text | req | |
| url | text | req | |
| nav_group | enum: primary / footer / utility | req | |
| visibility | enum: always / conditional-on-application-open / conditional-on-alumni-published | req | Drives Apply/Alumni auto-appearance |
| display_order | number | req | |
| is_active | boolean | req | |

---

## 15. `contact_routes` (Forms Manager — Contact form)

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| id | PK | — | |
| route_label | enum: Founder enquiry / Partner enquiry / Media enquiry / General enquiry | req | Section 14 |
| routing_email | text | req | Destination inbox |
| microcopy | text | opt | Description shown under each route option |

---

## 16. `newsletter_subscribers` (only if/when activated)

| Field | Type | Req/Opt | Notes |
|---|---|---|---|
| id | PK | — | |
| email | text | req | |
| subscribed_at | datetime (auto) | — | |
| consent | boolean | req | |
| source_page | text | opt | |

---

## Relationship Summary (quick reference)

- `founders` 1—1 (or 1—many) `founder_stories`
- `founders` many—many `cohorts`
- `founders` many—many `outcome_tags`
- `founder_stories` many—many `evidence_records`
- `impact_metrics` many—1 `evidence_records`
- `articles` many—1 `founders`, many—1 `cohorts`
- `events` many—many `founders`
- `cohorts` many—many `partners`, many—many `founders`, many—many `events`
- `leads` and `applications` are standalone (no FK relation to each other — intentional, per Guy)
- `nav_items` reads from `site_config.application_status` and `site_config.alumni_visibility` to resolve conditional visibility

---

## Publish-Gate Rules (must be enforced at the system level, not editorial reminders)

1. `impact_metrics.publish_status ≠ "verified"` → **must not render** on live site.
2. `founder_stories.quote_permission_status ≠ "granted"` → quote must not render (story can still publish without the quote block).
3. `partners.logo_permission_status ≠ "granted"` → logo must not render (partner can still be listed by name/type if approved otherwise).
4. `site_config.alumni_visibility = "hidden"` → `/alumni/` not indexed, not in nav, ideally not publicly reachable at all.
5. `site_config.ceo_message_visibility = "hidden"` → module not rendered on `/about/`.
6. `applications` table only accepts submissions when `site_config.application_status = "open"`; `leads` table only accepts submissions when `= "closed"`.

---

*This schema operationalizes Section 16 (CMS Content Model) of the master text pack and Section 3/7 of the Technical Build Spec into implementation-ready tables. Field types are indicative — Mahdi to map to the actual CMS/database engine chosen (Section 1 of Technical Build Spec).*
