# ASIP v2 docs vs current implementation

**Sources (08 Nov 2026, locked):**

- Final Design & Audience Experience Brief
- Final Text Pack & Sitemap v2.0

**Compared against:** current marketing routes, `constants/*-copy.ts`, homepage composition, nav, and Nov 2–6 American-English / pathway work.

**Rule:** Text Pack v2 + Design Brief supersede the August pack and earlier visual notes. Where Nov 2–6 work conflicts with v2, **v2 wins**.

Extracted PDF text (for reference):

- `Docs/[11] Their Edits/ASIP_-_Feedback_Brief_-_09.11.2026__1_.txt`
- `Docs/[11] Their Edits/ASIP_-_Website_-_Text_Pack_Sitemap_-_Revisited_09.11.2026__1_.txt`

Use the blocks below as work units. Each block is independent enough to start later without re-reading the full PDFs.

---

## Already close (do not rebuild)

- Sitemap base exists: Home, About, Program/Programme, Founders, Impact, Partners, Insights, Register Interest, Apply (gated), FAQ, Contact.
- No new top-level Investor page required unless routing cannot stay obvious via homepage anchors + Founders + Partners.
- Register Interest default when applications closed; Apply via CMS switch.
- 2025 as Portfolio Support Year (do not invent a 2025 cohort).
- Evidence discipline for metrics already in CMS direction.
- “Connecting Energies” treated as intentional Telecel brand line.

---

## Block A — Homepage audience pathways

**Status:** ✅ Done (2026-11-22)

| Item | Was | Now |
| --- | --- | --- |
| Prompt / CTAs | `I am` → Investor / Startup | **I’m a Founder** / **I’m an Investor** (FR: Je suis fondateur / Je suis investisseur) |
| Founder destination | Apply / Register Interest (`intake`) | `#founders` → 2026 next-chapter section (interim until Block B) |
| Investor destination | `register-interest` | `#investors` → ecosystem / partners section (interim until Block B) |
| Visibility | Present in hero | Above the fold; only two primary hero CTAs |
| Next-chapter CTAs | Shared pathways labels | Decoupled to `nextChapter.primaryCta` / `secondaryCta` (Block C will lock AI Advantage labels) |

**Done when**

- [x] Labels match locked CTAs exactly
- [x] Founder and Investor routes feel immediate (anchor scroll)
- [x] No five/six equal CTAs above the fold

**Follow-up in later blocks**

- Block B: dedicated founder/investor modules higher on the page; move `#founders` / `#investors` onto those modules
- Block C: next-chapter CTA labels → Explore the AI Next Cohort / See 2026 activity

---

## Block B — Homepage section order

**Status:** Major reorder needed

**Required order**

1. Hero + two audience routes
2. 2026 AI Advantage spotlight
3. Proof strip (3–4 verified numbers, little copy)
4. Founder pathway module
5. Investor pathway module
6. Founder stories / portfolio
7. Africa footprint map
8. Ecosystem / partners (value before logos)
9. Current activity / insights (populated only)
10. Close + status CTA (Register Interest / Apply + investor/partner route)

**Current order**

1. Hero
2. Cohort film
3. Impact metrics
4. Platform model
5. Outcomes
6. Ecosystem
7. Telecel connection
8. **2026 next chapter (too low)**
9. Latest insights

**Likely files**

- `components/marketing/home-page-content.tsx`
- Related `components/marketing/home-*-section.tsx`
- New/adapted modules for founder pathway, investor pathway, Africa map, closing CTA if missing

**Done when**

- [ ] 2026 AI Advantage is the first meaningful scroll after hero
- [ ] History / institutional explanation sits deeper or off-home
- [ ] Five-second founder and investor tests pass (Design Brief §12)

---

## Block C — Locked homepage copy (Text Pack v2)

**Status:** Mostly mismatched

| Module | Current (approx) | Locked v2 |
| --- | --- | --- |
| Hero H1 | `African founders. Built to scale.` | `African founders. Real solutions. Impact that scales.` |
| Hero support | Longer “connects…” sentence | Locked shorter paragraph (≤ ~35 words) |
| Hero CTAs | Investor / Startup | I’m a Founder / I’m an Investor |
| 2026 eyebrow | `2026 cohort` | `2026 NEXT CHAPTER` |
| 2026 headline | Partial AI wording | **Building the AI Advantage** |
| 2026 support | Current next-chapter paragraph | Locked AI Advantage sentence |
| 2026 CTAs | Investor / Startup | **Explore the AI Next Cohort** / **See 2026 activity** |
| Founder pathway | Missing as dedicated module | `Build what comes next.` + Explore the founder journey |
| Investor pathway | Missing as dedicated module | `See what is being built.` + Explore the portfolio / View current activity |
| Stories | Different framing | `Built from first-hand insight.` + Meet the founders |
| Impact | Different framing | `Proof lives in what founders build next.` + See the impact |
| Footprint | Missing / incomplete | `Across markets. Grounded in evidence.` |
| Ecosystem | Long ecosystem copy | `More than logos. Practical value.` + See the ecosystem |
| Insights | “From the portfolio.” | `What’s happening now.` + View insights |
| Close | Missing / different | `Building something that can scale?` → Register interest / Explore the portfolio |

**Density rules**

- Hero support ≤ ~35 words
- Standard modules generally 20–45 / max ~60 words before progressive disclosure
- Cards: one idea in 10–25 words
- One screen, one job

**Likely files**

- `constants/home-copy.ts`
- Home section components that hardcode strings (prefer constants)

**Done when**

- [ ] Every home module H1 / support / CTA matches the pack (no paraphrase)
- [ ] Empty shells / “coming soon” filler removed

---

## Block D — British English + Program lock-up only

**Status:** Current site is largely American English (Nov 2–6). v2 reverses running copy.

**v2 house style**

- British English in running copy: programme, organisation, commercialise, prioritise, behaviour, enquiry
- Use **Program** only in approved lock-up:
  - Africa Startup Initiative Program
  - A Telecel Group Program
- Elsewhere: **programme**
- No em dashes
- Sentence case headings unless formal name
- Reduce generic connect / connected / connecting (keep Connecting Energies as brand)

**Likely files**

- `constants/*-copy.ts`
- `components/layout/site-nav-labels.ts`
- `components/layout/site-footer-labels.ts`
- Marketing labels, FAQ, legal where public-facing
- Do **not** blindly revert admin/CMS internal labels unless public-facing

**Done when**

- [ ] Public EN running copy is British
- [ ] Program appears only in lock-up / formal ASIP name contexts
- [ ] Checklist item from Text Pack §18 passes

---

## Block E — Route / nav naming

**Status:** Partial conflict

| Item | Current | v2 |
| --- | --- | --- |
| Programme URL | `/program` (+ redirect from `/programme`) | Public nav URL **`/programme/`** |
| Nav label | Program | Programme (running nav language) |
| Alumni | In Founders dropdown; not indexable | Keep **hidden** until Alumni Network approved |
| Investor page | None | Do not add top-level page unless necessary |

**Likely files**

- `constants/public-pages.ts`
- `constants/legacy-redirects.ts`
- `constants/routes.ts` (if present)
- `components/layout/site-nav-labels.ts`
- `components/layout/site-footer-labels.ts`
- Programme page folder under `app/[locale]/(marketing)/`

**Done when**

- [ ] Public Programme URL matches locked sitemap (or documented technical constraint)
- [ ] Alumni not discoverable in public nav until approved
- [ ] Footer links match pack order/intent

---

## Block F — Programme page journey + eligibility

**Status:** Structure exists; stages and criteria differ

### Journey

| Current | Required |
| --- | --- |
| Discover → Select → Build → Open access → Commercialize → Grow (program page) | **Discover → Build → Test → Accelerate → Scale** |
| Home platform also uses Open access / Commercialize | Align to same five-stage momentum model |
| Process boxes / linear cards | Progressive reveal, not connected process boxes |

### Eligibility

| Current | Required |
| --- | --- |
| Five specific always-on criteria (woman in founding team, product in market, revenue/traction, full-time founder, real problem) | **General eligibility** only until cohort formally open |
| Shown on home “Who should apply” + program page | Cohort-specific criteria CONDITIONAL; do not publish unconfirmed stage/sector/dates/terms |

### Programme hero / value copy

Align H1/CTAs/value cards to Text Pack §07 (Build the company…; Register interest / Explore founders; value list: Practical expertise, Market access, Investor readiness, Technology & tools, Commercial pathways, Founder visibility).

**Likely files**

- `constants/programme-copy.ts`
- `constants/home-copy.ts` (platform steps + nextChapter.eligibility)
- Programme section components

**Done when**

- [ ] Journey stages match Discover / Build / Test / Accelerate / Scale
- [ ] General eligibility matches locked bullets
- [ ] Five specific criteria only appear if Telecel confirms they are the published open-cohort set

---

## Block G — About, Partners, Impact, Founders, Insights, FAQ, Contact, SEO

**Status:** Pages exist; locked H1s / framing need sync

### About

- Hero: `Started in 2019. Still building.`
- Compress history into build-log years (2019–2026), short milestones
- 2025 locked as Portfolio Support Year
- 2026 = Building the AI Advantage (do not imply applications open)
- Leadership message: HOLD until Telecel supplies final text/imagery

### Partners / Investors

- Hero: `Find the founders. Understand the opportunity.`
- Investor Q&A: portfolio quality, sectors/markets, what’s now, how to engage
- Contribution model before logo wall: Technology / Capital / Markets / Mentorship / Commercial Access
- Do not imply every company is fundraising or guaranteed investment access

### Impact

- Hero: `Proof, not promises.`
- Large verified numbers with reporting context
- Proof points remain VERIFY-gated (10,000+; 50+ countries applications; 40+ startups; 70% women-led; $50M+ top-five valuation)

### Founders

- Hero: `Meet the people building what comes next.`
- Card model: name/company, 10–18 word proposition, Country • Sector • Cohort, one verified outcome max on archive cards
- Bold portraits / full-card interaction / strong filters

### Insights

- Only populated categories
- Launch categories: Founder & Portfolio Stories + Programme Updates
- Hide Founder Resources / Partner Perspectives until content exists

### Contact / FAQ

- Contact routes: Founder enquiry / Investor-partner enquiry / Media enquiry (+ General)
- FAQ answers replaced with locked FAQ master copy (incl. Building the AI Advantage, applications status, investment disclaimer)

### SEO metadata

Replace page titles/descriptions with Text Pack §14 table (Home, About, Programme, Founders, Impact, Partners, Insights, Register Interest).

**Likely files**

- `constants/marketing-copy.ts`, `about` / `partners` / `impact` / `insights` / FAQ / contact label files
- `app/[locale]/(marketing)/*/page.tsx` metadata
- `lib/seo/marketing-metadata.ts` callers

**Done when**

- [ ] Each page H1 + primary CTAs match Final Implementation Map (Text Pack §17)
- [ ] Metadata table applied
- [ ] Empty Insights categories hidden

---

## Block H — Design & motion system (Design Brief)

**Status:** Content architecture mostly fine; experience pass outstanding

**Mandate (six changes that matter)**

1. Two unmistakable entry pathways (Founder / Investor)
2. Elevate 2026 AI Advantage into first meaningful scroll
3. Reduce text density sharply
4. Move away from repeated red blocks, identical card grids, safe symmetrical splits
5. Authentic founder/event photography + restrained AI/data visual language
6. Stay credible for investors/institutions while desirable to younger founders

**Visual**

- ASIP multicolour leads; Telecel red = endorsement anchor, not default module fill
- Century Gothic core; disruption via scale/crop/weight/spacing, not random fonts
- 2–3 signature homepage layout moments, not every module weird
- Avoid robots, neon brains, circuit-board clichés, synthetic people

**Motion**

- 200–500ms purposeful micro-interactions
- Respect `prefers-reduced-motion`
- Protect Core Web Vitals; lazy-load noncritical media
- Use interaction on: pathways, map, filters, impact count-up, journey scroll, founder cards, AI Advantage cues

**Benchmark**

- Antler for principles (pathway clarity, short copy, proof) — **not** palette/layout clone

**Done when**

- [ ] Design Brief §12 acceptance criteria pass on desktop + mobile
- [ ] Prompt 10-style screenshot audit: PASS / REVISE, then close top five deviations

---

## Block I — Evidence / VERIFY / conditional content

**Do not publish without clearance**

- Proof metrics (applications, countries, startups, women-led, $50M+)
- Named founder outcome stories (Herconomy, Primed e-Health, Weza, Qataloog, Proxalys, Lyfplus, Pharmaserv, Moja Ride, etc.)
- Partner logos / Government of Senegal naming
- Application-open CTAs, cohort dates, sector/stage criteria
- Alumni Network
- Leadership quotes/names
- Any fund / returns / LP claims (not website scope)

**Rule:** If VERIFY fails, remove the claim — do not invent filler.

---

## Suggested build order

1. **Block A + B** — pathways + homepage reorder (highest UX impact)
2. **Block C** — locked home copy
3. **Block D** — British English / Program lock-up
4. **Block F** — Programme journey + eligibility
5. **Block E** — `/programme` + Alumni hide
6. **Block G** — other pages + SEO + FAQ
7. **Block H** — visual/motion polish against acceptance criteria
8. **Block I** — evidence clearance before go-live numbers/stories

---

## Out of scope (explicit in packs)

- New portal, fund proposition, login/community platform
- Unapproved programme commitments
- Rewriting backend/CMS architecture
- Turning the whole brand into “AI-only”
- Copying Antler (or any accelerator) literally

---

## Quick reference — Final Implementation Map (locked labels)

| Page / module | Locked H1 / label | Primary action |
| --- | --- | --- |
| Home hero | African founders. Real solutions. Impact that scales. | I’m a Founder / I’m an Investor |
| Home 2026 | Building the AI Advantage | Explore the AI Next Cohort / See 2026 activity |
| Home founder | Build what comes next. | Explore the founder journey |
| Home investor | See what is being built. | Explore the portfolio / View current activity |
| Home stories | Built from first-hand insight. | Meet the founders |
| Home impact | Proof lives in what founders build next. | See the impact |
| About | Started in 2019. Still building. | Explore the journey |
| Programme | Build the company, not just the pitch. | Register interest / Explore founders |
| Founders | Meet the people building what comes next. | Explore the portfolio |
| Impact | Proof, not promises. | Explore founder outcomes |
| Partners | Find the founders. Understand the opportunity. | Explore the portfolio / Discuss collaboration |
| Insights | From the people building. | Explore insights |
| Register Interest | Your next build could start here. | Register interest |
| Contact | Start with the right conversation. | Founder / Investor-partner / Media enquiry |
