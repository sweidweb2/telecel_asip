# ASIP Website — Trello Task Backlog (v2 — structured by document section)
**Project:** Africa Startup Initiative Program (ASIP) Website — Phase 1
**Supplier:** Mahdi Ezzedine · **Project Lead:** Guy Bitar · **Exec Sign-off:** Eleanor
**Build window:** 25 Aug – 10 Sep 2026 · Today: 29 Aug 2026

> **How to use:** Each `##` = one Trello **List**, mapped 1:1 to the section numbers in the text pack (01–20), so nothing gets separated from the page it belongs to. Each `- [ ]` = one **card**. Where a page needs content, design, build, CMS and SEO work, those are grouped as checklist items *inside that page's own cards* — not spread into separate discipline-only lists. Two extra lists (00 and 21) hold pure board setup and the true cross-cutting technical work (hosting/security/performance) that doesn't belong to any single page.

> **Status legend (codebase scan, 29 Aug 2026):** `[x] ✅` = verified in the repo · `🟡` = partially built, note explains the gap · unchecked = not found in the codebase (or is a process/off-repo task that can't be verified from code).

---

## 00. Board Setup
- [ ] Create board "ASIP Website — Phase 1"; lists in the order of this doc (00 → 21)
- [ ] Labels: `Content`, `Design`, `Build`, `CMS`, `SEO`, `QA`, `Legal`, `Hold`, `Verify`
- [ ] Custom fields: Owner, Due Date, Evidence ID, Approval Gate
- [ ] Members: Guy (lead/approver), Eleanor (exec validation), Supplier/dev, QA, Legal/DPO

---

## 01. Document Control
- [ ] Eleanor formally validates this pack as the single supplier content source — log sign-off date
- [ ] Circulate LOCKED/VERIFY/HOLD table to full team; confirm everyone understands what cannot be reopened
- [ ] Set up Evidence Register (per Section 16 fields) to track every item marked VERIFY across all pages
- [ ] Confirm single feedback route: all supplier feedback consolidated through Guy only
- [ ] Add "Launch Standard" as a recurring QA gate: no lorem ipsum, no broken links, no inactive forms, no unverified claims, no unfinished pages at go-live
- [ ] Confirm with supplier: no scope creep — no new portal, member login, CRM, production shoot, or campaign deliverable

## 02. Sitemap & Page Architecture
- [x] ✅ Build primary nav (8 items): Home, About, Programme, Founders, Impact, Partners, Insights, Register Interest — 🟡 `SiteNavbar` ships 8 items but includes Alumni and carries Register Interest/Apply as the CTA instead of a nav link
- [x] ✅ Build conditional nav logic: Alumni (build page, keep out of nav until approved), Apply (reuse Register Interest template, keep hidden until cohort dates confirmed) — 🟡 Apply/Register Interest swap is fully wired (`middleware.ts` + `site_settings.open_applications`); Alumni is currently visible in the navbar and must be removed until approved
- [x] ✅ Build utility/footer nav: Contact, FAQ, Privacy, Terms, Telecel Group, Social channels — `SiteFooter` + `site-footer-labels`
- [x] ✅ Confirm URL structure matches doc exactly (/about/, /programme/, /founders/, /impact/, /partners/, /insights/, /register-interest/, /alumni/, /apply/) — all present under `/en` and `/fr`
- [x] ✅ QA: verify nav visibility toggles work without a code deploy (CMS-driven flags) — driven by the `site_settings` row read in middleware/layouts

## 03. Brand Voice & Copy Rules
- [ ] Distribute Use/Avoid voice table to every copywriter and to supplier's UX writer (if any)
- [ ] Add "Core public positioning" master copy as the fixed About/meta reference line — no rewriting without Guy approval
- [ ] Editorial pass on all page copy against Avoid list: no institutional/CSR-brochure tone, no generic "empower/enable/support" without a "how", no deficit framing, no slogan-stacking
- [x] ✅ Confirm narrative spine (2019 origin → founder journeys → verified impact → stronger ecosystem → 2026 next chapter) is visibly reflected in Home + About page flow — Home modules 01–08 and the About story/timeline sections follow this order

## 04. Global Navigation, Status Banner & Footer
- [ ] Build header: "Africa Startup Initiative Program" + "A Telecel Group Program" lockup; enforce logo-pairing rule (ASIP primary, Telecel secondary, no double-branding in one viewport)
- [ ] Build **Application Status Banner** component with two CMS-editable states — no standalone banner component exists; status is only expressed through the nav CTA
  - [ ] Default state copy: "The next ASIP chapter is taking shape." + Register Interest CTA
  - [ ] Open state copy (HOLD — build but keep inactive): "Applications for the next ASIP cohort are now open." + Apply CTA
  - [x] ✅ Confirm the toggle is a CMS field Guy can flip — not a code release — `site_settings.open_applications`, admin-editable at `/dashboard/settings`
- [x] ✅ Build footer: proposition line, description, [Telecel Group] + [Contact ASIP] CTAs, full footer link list, social channels (only where officially confirmed)
- [x] ✅ QA: confirm Open-state banner is genuinely unreachable/unpublishable until written confirmation is logged — 🟡 `/apply` is hard-redirected to `/register-interest` while the flag is off and is `noindex` + sitemap-excluded; there is no banner to gate yet

## 05. Home Page
- [x] ✅ **Module 01 Hero**: build hero with headline/subhead, [Explore the founders] + [Register interest] CTAs; muted founder-led motion loop with mobile fallback image; copy/CTAs must render before video loads — `HomeHero` has muted video + poster + `next/image` fallback
- [x] ✅ **Module 02 Seven Years of Impact**: build restrained proof strip — 🟡 the module renders from `home-copy`, but metrics are hardcoded and not bound to any Evidence Register (no such table exists), so the "do not display until verified" guard is not enforceable yet
- [x] ✅ **Module 03 Platform Model**: build 5-step card layout (Discover, Build, Connect, Commercialise, Scale) with copy from doc
- [x] ✅ **Module 04 Founder Spotlight**: build carousel/grid, feature 3–5 evidence-backed founder stories, [Explore all founders] CTA — `getSpotlightStartups(5)`
- [x] ✅ **Module 05 Impact**: build 2–3 founder outcome cards, [See the impact] CTA — no quantitative claims until validated
- [x] ✅ **Module 06 Ecosystem**: build partner roles/contribution module (not a logo wall), [Partner with ASIP] CTA, approved logos only — 6 partner roles + `constants/partner-logos.ts`
- [x] ✅ **Module 07 Telecel Connection**: build concise "Powered by Connecting Energies" module, [About Telecel Group] CTA — Telecel as backer/connector, not hero
- [x] ✅ **Module 08 2026 Next Chapter**: build module with [Register interest] + [Discuss a partnership] CTAs — do not publish unconfirmed dates/funding/AI fund/partner commitments
- [x] ✅ **Module 09 Latest**: build feed pulling from Insights content type, [Explore insights] CTA — `getLatestInsights(locale, 3)`
- [x] ✅ Page-level SEO: implement meta title/description from Section 15 table — via `buildMarketingMetadata` + Organization JSON-LD
- [x] ✅ Page-level QA: mobile fallback for hero video, verify all 9 module CTAs route correctly — 🟡 fallback verified in code; CTA routing has no automated test beyond `e2e/public-site.spec.ts`

## 06. About ASIP
- [x] ✅ Build Hero: "Backing the builders shaping Africa's next chapter" + intro copy
- [x] ✅ Build "Our Story" module (Barcelona/MWC origin + programme evolution copy) — `AboutOurStorySection`
- [x] ✅ Build Mission module, Vision module, Belief module (as separate distinct blocks per doc) — `AboutNarrativeSplitSection` ×2 + `AboutBeliefSection`
- [x] ✅ Build Journey Timeline component (2019–2026) using exact milestone copy from doc — `AboutJourneyTimeline`
  - [ ] Cross-check 2021–2024 cohort wording against final Startupbootcamp cohort master records before publish
- [x] ✅ Build CEO/Founder Message module — **HOLD** — `AboutCeoMessageSection` renders only when `narrative.ceoMessage` is supplied, so no placeholder ships
- [x] ✅ Build Telecel Connection module ("built on Connecting Energies" copy)
- [x] ✅ Page-level SEO: meta title/description from Section 15
- [x] ✅ Page-level QA: confirm CEO message module renders as hidden/draft, not as a visible placeholder — conditional render + `about-page-content.test.tsx`

## 07. The Programme
- [x] ✅ Build Hero with [Register interest] + [Explore past cohorts] CTAs
- [x] ✅ Build "Who it is for" module — `programme-copy.audience`
- [x] ✅ Build Founder Journey component — 6 stages (Discover, Select, Build, Connect, Commercialise, Grow) with doc copy
- [x] ✅ Build "What founders gain" module — 7 value cards
- [x] ✅ Build General Eligibility list (6 bullet points from doc)
- [ ] Implement **Cohort Rule** logic: general eligibility copy must be swappable for officially approved cohort-specific criteria/dates/format/terms once applications open — build as a CMS block, not hardcoded copy — currently hardcoded in `constants/programme-copy.ts`
- [x] ✅ Page-level SEO: meta title/description from Section 15
- [ ] Page-level QA: verify cohort-copy swap mechanism works without redeploy — blocked by the card above

## 08. Founders & Portfolio
- [x] ✅ Build Hero + [Explore all founders] CTA + directory introduction copy
- [x] ✅ Build Founder content type/fields — 🟡 `startups` + `startup_details` with admin CRUD; cohort/year is only `founded_at`, and there are no sector/status/outcome taxonomies or Evidence fields
- [x] ✅ Build filter system — 🟡 only founded-year `Select` + name search shipped; Sector, Country, Status and Outcome filters are not built
- [x] ✅ Build free-text Search across startup name, founder, product, sector, problem statement — 🟡 search covers name/slug only (trgm-backed)
- [x] ✅ Build backend search/filter endpoint for the above (pagination + indexing for the free-text field) — `getActiveStartupsPage` + `PortfolioPagination` + trgm GIN indexes (Server Actions/`data/`, no REST route)
- [x] ✅ Build Founder Card template (sector • country • cohort, name, one-line value prop, [View founder story]) — `StartupCard`
- [x] ✅ Build Founder Profile template — 🟡 `/founders/[slug]` detail page exists via `startup_details`; the 7 prescribed modules (problem, what they built, ASIP connection, where they are now, founder perspective w/ permission, media gallery) are not modelled as discrete fields
- [ ] Populate/validate priority launch stories once Startupbootcamp records confirmed: Herconomy, Primed e-Health, Weza Ventures, Qataloog, Proxalys, Lyfplus, Pharmaserv, Moja Ride
- [ ] Publish-guard: profile cannot go live without Problem/Built/Connection/Outcome fields populated + quote permission = approved
- [x] ✅ Page-level SEO: meta title/description from Section 15; ensure founder profiles are indexable, clean URLs — `generateStaticParams` + `generateMetadata`, server-rendered HTML, in sitemap
- [x] ✅ Page-level QA: test every filter combination + search edge cases — 🟡 `e2e/portfolio-startups.spec.ts` covers the shipped year+search filters only

## 09. Impact
- [x] ✅ Build Hero: "The story is what happened next" copy
- [x] ✅ Build "Seven Years of Impact" narrative module
- [x] ✅ Build Impact Lens table/module — 6 lenses (Pipeline, Inclusion, Business growth, Commercialisation, Jobs & capability, Sector outcomes) each showing Public framing + tied to Evidence needed fields — 🟡 lenses and "evidence needed" text render from `constants/impact-copy.ts`; nothing is tied to real evidence records
- [ ] Build Case Study template with bracketed placeholders [Startup]/[barrier]/[support]/[capability]/[outcome] — enforce that brackets cannot go live unreplaced
- [ ] Enforce Evidence Rule: every published metric requires source, measurement period, owner, last-verified date, permission status before publish — the rule is written as copy, but there is no Evidence table or publish guard
- [x] ✅ Page-level SEO: meta title/description from Section 15
- [ ] Page-level QA: confirm no generic "success copy" is live disguised as a real case study

## 10. Partners & Mentors
- [x] ✅ Build Hero + [Discuss a partnership] CTA
- [x] ✅ Build Partner Proposition module
- [x] ✅ Build Partner Type table/module — 6 types each with value + engagement examples — `constants/partners-copy.ts`
- [ ] Build Partner/Mentor content type fields (Section 16): name, org, type, role/contribution, active/historical, logo permission flag, link — no table; logos are a static constant
- [ ] Confirm logo usage: current or approved historical partners only — no inferring permission from old decks
- [x] ✅ Page-level SEO: meta title/description from Section 15
- [ ] Page-level QA: verify every displayed partner logo has a logged permission flag = approved — no permission flag exists to check

## 11. Alumni Experience (build now, hold public activation)
- [x] ✅ Build full page/template as draft/hidden (not in primary nav) — 🟡 page is built, `noindex` and sitemap-excluded, **but it is currently linked in `SiteNavbar`** and must be pulled out
- [x] ✅ Build Hero (HOLD copy), Purpose (HOLD copy), Proposed Benefits table (5 items) exactly as drafted — `constants/alumni-copy.ts`
- [x] ✅ Confirm Scope Rule with supplier: no login, member dashboard, chat, or community-platform functionality in Phase 1 — page is content-only — verified content-only in code
- [ ] Add activation runbook card: steps to unhide + add to nav once Alumni Network operating model + launch are formally approved
- [x] ✅ Page-level SEO: prepare meta fields but ensure page is `noindex` while hidden — `noIndex: true` in both locales

## 12. Insights & Resources
- [x] ✅ Build Hero + intro copy
- [ ] Build content stream taxonomy: Founder Stories, Portfolio News, Programme Updates, Founder Resources, Partner Perspectives — `blogs.categories` is free-text with generic `blog-categories.ts`, not these 5 streams
- [x] ✅ Build Article/Case Study content type — 🟡 `blogs` covers title/author/date/categories/media/SEO; missing related founder/cohort links and a sources field
- [x] ✅ Build listing page (filter/sort by stream) + article template — 🟡 listing + `/insights/[slug]` template with Article/Person JSON-LD; stream filtering not built
- [ ] Build Newsletter/Updates capture module — **keep inactive at launch** — module not built at all
- [x] ✅ Page-level SEO: meta title/description from Section 15; Article schema markup
- [ ] Page-level QA: confirm newsletter form is genuinely disabled, not just visually hidden — n/a until built

## 13. Register Interest / Apply
- [x] ✅ Build single shared template with two controlled states — shared `ApplyPageContent` behind `/register-interest` and `/apply`
- [x] ✅ Build **Default state** (live at launch): Hero copy + [Register founder interest] CTA + form
- [x] ✅ Build **Open state** (HOLD): Hero copy + [Start application] CTA + form — activate only after written confirmation — `/apply` exists, `noindex`, and is redirected away until `open_applications` is flipped
- [ ] Build Application Journey component — 6 steps (Check criteria, Tell us what you're building, Initial review, Founder conversations, Final selection, Onboarding) — apply copy ships 3 preparation cards, not the 6-step journey
- [x] ✅ Build form fields exactly per doc — 🟡 `interest_registrations` captures name/email/phone/company/sector/country/pitch/consent; missing role, LinkedIn, website, year founded, stage, team size, traction, programme fit, and separate comms-preference/accuracy declarations
- [x] ✅ Server + client validation; spam protection (captcha/honeypot) — Zod on both sides + Cloudflare Turnstile (`action=apply`) + per-IP/per-email rate limiting; 🟡 no honeypot field
- [ ] Confirm and wire submission routing (inbox/CRM) — flag as a dependency for Guy to confirm owner — submissions land in the DB only; no email/CRM delivery
- [ ] Data retention + consent-timestamp logging (coordinate with Legal/DPO) — consent is a boolean with no timestamp, policy version, or retention job
- [x] ✅ Page-level SEO: meta title/description from Section 15
- [ ] Page-level QA: full submit-to-inbox test for both Default and Open states — no inbox wired; no E2E covering the apply gate

## 14. Contact & FAQ
- [x] ✅ Build Contact Hero + [Founder enquiry] [Partner enquiry] [Media enquiry] routing tabs — `ContactExperience` + `contact_enquiry_type` enum
- [x] ✅ Build routing microcopy + General enquiry fallback route — `general` enum value present
- [ ] Wire each route to its correct destination inbox/owner — enquiry type is stored, not routed to any inbox
- [x] ✅ Build FAQ accordion with all 10 Q&As from the master copy, verbatim — `FaqTabsSection` + FAQPage JSON-LD
- [x] ✅ Page-level SEO: meta title/description — 🟡 drafted consistently with other pages; still needs Guy's confirmation
- [ ] Page-level QA: test all 3 enquiry routes deliver to correct inbox; confirm FAQ answer about application status pulls live from the same source as the global status banner — FAQ status copy is static, not read from `site_settings`

## 15. SEO, Metadata & Discovery (sitewide, cross-page)
- [x] ✅ Implement meta title + description for every page per Section 15 table — `lib/seo/marketing-metadata.ts` on every marketing route
- [x] ✅ Ensure portfolio/founder content is real crawlable HTML (not JS-only rendering with no fallback) — Server Components + `generateStaticParams`
- [x] ✅ Implement clean URLs sitewide, editable social-sharing (OG/Twitter) fields per page/article — 🟡 OG/Twitter are emitted per page and articles use their thumbnail, but the fields are code-defined, not CMS-editable; no dynamic OG image route
- [ ] Implement useful alt text on all images sitewide
- [x] ✅ Build 301 redirect map from legacy ASIP website URLs (per Legacy ASIP website PDF) to new URLs — 🟡 `redirects()` in `next.config.ts` driven by `constants/legacy-redirects.ts` (locale-less + `/en`|`/fr` variants, literal 301, covered by Vitest); the map is seeded from the legacy site's known WordPress-style paths and still needs reconciling line-by-line against the Legacy ASIP website PDF inventory
- [x] ✅ Confirm templates are French-ready (string externalization) but explicitly do NOT populate French copy in Phase 1 — 🟡 templates are fully externalized, but French copy **is** populated (ahead of stated Phase 1 scope — confirm with Guy); DB content (insights/founders) has no translated columns
- [x] ✅ XML sitemap (excludes Alumni/Apply while hidden) + robots.txt — 🟡 `app/sitemap.ts` + `app/robots.ts` done with hreflang; Search Console submission/verification not done

## 16. CMS Content Model & Data Fields (sitewide, cross-page)
- [ ] Build all 7 content types exactly as specified — 🟡 only Founder/startup and Article exist; Founder story, Cohort/year, Impact metric, Partner/mentor and Event are missing
- [ ] Build the 8 Internal Evidence fields as a reusable field-group attached to every claim-bearing content type — not built anywhere
- [ ] Set CMS permissions: editors draft; only Guy moves Evidence status to "verified"/publish; Eleanor gets view-only exec preview — 🟡 `user_role` enum has admin/editor/viewer but every policy checks `is_admin()` only
- [ ] Build editorial workflow: Draft → Pending Evidence Review → Approved → Published — 🟡 only draft/published (blogs) and draft/active/inactive (startups)
- [ ] Deliver CMS training + documentation so Telecel can maintain the site without vendor dependence (explicit RFQ requirement)

## 17. 2025/2026 & Sensitive Narrative Controls (audit pass, cross-page)
- [ ] Audit every page for 2019 origin references — approved archive imagery + validated dates only
- [ ] Audit every page for 2025 references — must read as "Portfolio Support Year," never imply a new 2025 cohort
- [ ] Audit every page for 2026 references — "next chapter/comeback in progress" only, no unconfirmed dates/terms/partners
- [ ] Audit "Seven Years of Impact" usage sitewide — never "seven years of continuous programme delivery"
- [ ] Confirm Alumni Network content stays hidden until operating model + launch approved — ⚠️ currently reachable from the navbar
- [x] ✅ Confirm CEO message stays unpublished until supplied/approved — conditional render, no placeholder
- [ ] Confirm no AI accelerator/fund content is public anywhere (internal strategic material only)
- [ ] Confirm partner logos are current/approved-historical only, nothing inferred from old decks
- [ ] Confirm every metric sitewide is evidence-backed per Evidence Register before publish

## 18. Supplier Implementation Plan (schedule/gates)
- [ ] 24 Aug — Executive validation gate (retro-confirm status given today = 29 Aug)
- [ ] 25 Aug — Formal content kickoff: pack, assets, data gaps list, technical access owner delivered to supplier (retro-confirm status)
- [x] ✅ 26–28 Aug — UX + design system: homepage, mobile view, nav, founder-card system, impact modules, motion direction — commits `336bca8` / `aac0543` land the public page layouts, nav, founder cards and impact modules
- [ ] 29 Aug — Design Gate: one consolidated Telecel feedback round, no structural reopening after
- [x] ✅ 30 Aug–4 Sep — Build + content population: core templates, CMS content types, founders, forms, SEO, analytics, responsive behaviour — 🟡 templates, founders, forms, SEO and responsive behaviour are in; CMS content types are incomplete and analytics is not started
- [ ] 5–7 Sep — UAT + corrections: functional, mobile, content, links, forms, accessibility, performance
- [ ] 8 Sep — Executive preview: final website preview; only launch-critical corrections after
- [ ] 9 Sep — Release readiness: final content lock, backups, credentials, redirects, analytics, launch checklist
- [ ] 10 Sep — GO-LIVE: deploy, verify production, confirm training/source files/warranty contact
- [ ] Re-baseline this list against actual status now that today is 29 Aug — flag any gate that's slipped

## 19. Implementation & Publication Checklist (final gate before launch)
- [ ] Eleanor validates final pack as single supplier content source
- [ ] Supplier confirms all templates/content types/conditional states understood within accepted RFQ fee
- [ ] Startupbootcamp cohort/founder records reconciled against Founders directory
- [ ] All Home + Impact metrics green-lit with source, period, owner
- [ ] Founder stories/testimonials have attribution + permission status
- [ ] Partner/mentor list current; logo permissions confirmed
- [ ] 2025 presented as Portfolio Support Year, not a new cohort
- [ ] 2026 status language matches latest confirmed info
- [ ] Alumni page remains hidden unless launch formally approved — ⚠️ page is `noindex` but still linked in the navbar
- [x] ✅ CEO/Founder message supplied+approved before publish, or module stays hidden — module stays hidden by default
- [ ] Forms route to confirmed inboxes with privacy/consent language — 🟡 privacy/consent copy exists; inbox routing does not
- [ ] No placeholder content, broken links, or unverified claims remain
- [ ] Source code, credentials, backups, design/source files, CMS training, warranty handover complete

## 20. Source Basis & Outstanding Validation (reference/audit)
- [ ] Log all 8 source documents on the board (Telecel ASIP Story 4, ASIP Profile, Legacy website PDF, Gifty concept note, AI relaunch memo, Telecel Message & Comms Guidance 2023, Telecel Branding Book, RFQ + supplier proposal) as attachments for reference
- [ ] Flag Known Gap explicitly: full Startupbootcamp investor reports, final cohort master lists, founder permissions, and current portfolio outcomes are not yet in hand — track as a standing dependency until closed
- [ ] Confirm nothing from the AI relaunch memorandum (internal-only) leaks into public copy anywhere on the site

---

## 21. True Cross-Cutting Technical Work (not tied to one page)
*(Everything else genuinely spans the whole site rather than belonging to one section above — infra, security, performance, integrations.)*
- [x] ✅ Confirm CMS/hosting platform decision + document rationale — Next.js 16 + Supabase with a custom admin dashboard; documented across `Docs/[06] Documentation` — 🟡 no vendor-independence handover doc yet
- [x] ✅ SSL/HTTPS, CDN, caching strategy for the whole site — HSTS + security headers and a marketing/static/dashboard cache-control split in `next.config.ts`; see `Docs/[06] Documentation/[6.6] CDN and storage architecture.md`
- [ ] Backups (automated, tested restore) + credentials/secrets handover list — a `/dashboard/backup` route exists but no automated backup, tested restore, or credentials handover list
- [ ] Analytics (GA4/tag manager) + cookie consent banner (blocks non-essential tags pre-consent) — neither is implemented; `/dashboard/analytics` is an empty page
- [x] ✅ Security hardening: WAF/rate limiting on form + search endpoints, spam protection — 🟡 Turnstile + `lib/rate-limit.ts` on both public forms, RLS on every table, service-role-only inserts; the limiter is in-memory (not shared across serverless instances) and there is no WAF or search-endpoint limit
- [ ] Accessibility pass sitewide (WCAG 2.1 AA) — automated + manual screen-reader spot checks — no axe/a11y tooling installed
- [x] ✅ Performance budget sitewide (Core Web Vitals) + image pipeline (responsive/WebP/lazy-load) — 🟡 image pipeline done (`lib/media/process-image`, Sharp → WebP, versioned paths, `next/image`); no measured CWV budget or Lighthouse CI
- [x] ✅ CI/CD pipeline staging→production with rollback — 🟡 `.github/workflows/ci.yml` (lint, typecheck, Vitest, build, Playwright) and `deploy-migrations.yml` are in place; there is no staging→production deploy job and no rollback path
- [ ] Legal/DPO review of data collection across all forms (retention, consent, applicable regime)
- [x] ✅ Library/dependency audit (CMS, JS framework, captcha, analytics, image processing) + patch cadence plan — 🟡 approved stack documented in `Docs/[06] Documentation/[6.5] Libraries.md`; no `npm audit`/Dependabot workflow or patch cadence

---

### ⚠️ Schedule Risk Note
The gate dates in Section 18 (24 Aug → 10 Sep) were written before today. Since today is 29 Aug 2026, the first real task on the board should be confirming with Guy which Section 18 gates have already passed (mark those "Done" retroactively with evidence) versus which need re-baselining against the 10 Sep deadline.

### Scan summary (29 Aug 2026)
**Strong:** all 14 marketing pages built in `en` + `fr` with real French copy, full SEO metadata/sitemap/robots/JSON-LD, founders directory with detail pages and search, insights/blogs, contact + register-interest forms with Turnstile and rate limiting, admin dashboard CRUD, RLS on every table, image pipeline, CI with 23 Vitest files and 6 Playwright specs.

**Biggest remaining risks, in order:**
1. **Evidence Register does not exist** — blocks Impact publish rules, Home metrics, and the editorial workflow (§09, §16, §17).
2. **No form delivery** — register-interest and contact submissions sit in the database with no inbox or CRM routing (§13, §14).
3. **Alumni is linked in the navbar** despite being a HOLD page (§02, §11, §17, §19).
4. **Analytics + cookie consent missing**, and there is no Legal/DPO review of consent/retention (§21).
5. **Missing content types** — cohort, impact metric, partner/mentor, event; founder profile lacks the 7 prescribed story fields (§08, §10, §16).
6. **Legacy 301 redirect map shipped but unverified against the PDF inventory**, no a11y/CWV tooling, no handover package (README, CMS training, backups, credentials, launch checklist) (§15, §19, §21).
