# ASIP v2 docs vs current implementation

**Sources (08 Nov 2026, locked):**

- Final Design & Audience Experience Brief
- Final Text Pack & Sitemap v2.0

**Compared against:** marketing routes, `constants/*-copy.ts`, homepage composition, nav (incl. `design/genz-refresh-plan` on local `dev`).

**Rule:** Text Pack v2 + Design Brief supersede the August pack and earlier visual notes. Where Nov 2–6 work conflicts with v2, **v2 wins**.

**Progress source:** `design/genz-refresh-plan` merged into local **`dev`**, plus follow-up closes on 2026-11-22 (`/programme` rename, inner polish, fonts note, CMS one-liners, VERIFY gating).

Extracted PDF text (for reference):

- `Docs/[11] Their Edits/ASIP_-_Feedback_Brief_-_09.11.2026__1_.txt`
- `Docs/[11] Their Edits/ASIP_-_Website_-_Text_Pack_Sitemap_-_Revisited_09.11.2026__1_.txt`

---

## Already close (do not rebuild)

- ✅ Sitemap base exists: Home, About, Programme, Founders, Impact, Partners, Insights, Register Interest, Apply (gated), FAQ, Contact.
- ✅ No new top-level Investor page required unless routing cannot stay obvious via homepage anchors + Founders + Partners.
- ✅ Register Interest default when applications closed; Apply via CMS switch.
- ✅ 2025 as Portfolio Support Year (do not invent a 2025 cohort).
- ✅ Evidence discipline for metrics already in CMS direction.
- ✅ “Connecting Energies” treated as intentional Telecel brand line.

---

## Block A — Homepage audience pathways

**Status:** ✅ Done

- [x] Labels match locked CTAs exactly
- [x] Founder and Investor routes feel immediate (anchor scroll)
- [x] No five/six equal CTAs above the fold

---

## Block B — Homepage section order

**Status:** ✅ Done (`home-v2-sections`)

- [x] 2026 AI Advantage is the first meaningful scroll after hero
- [x] History / institutional explanation sits deeper or off-home
- [x] Five-second founder and investor tests pass (Prompt 10 audit)

---

## Block C — Locked homepage copy (Text Pack v2)

**Status:** ✅ Done (`constants/home-v2-copy.ts`)

- [x] Every home module H1 / support / CTA matches the pack
- [x] Empty shells / “coming soon” filler removed

---

## Block D — British English + Program lock-up only

**Status:** ✅ Done

- [x] Public EN running copy is British
- [x] Program appears only in lock-up / formal ASIP name contexts
- [x] Checklist item from Text Pack §18 passes
- ✅ Client direction: **v2 British English wins** over the older Nov American-English ask (repo rule + Text Pack lock)

---

## Block E — Route / nav naming

**Status:** ✅ Done

| Item | Status |
| --- | --- |
| Public Programme URL | ✅ Canonical **`/programme`**; `/program` 301s to `/programme` |
| Nav label | ✅ Programme |
| Alumni | ✅ Hidden from public nav until approved |
| Investor page | ✅ None (anchors + Partners / Founders) |

- [x] Public Programme URL matches locked sitemap
- [x] Alumni not discoverable in public nav until approved
- [x] Footer links match pack order/intent

---

## Block F — Programme page journey + eligibility

**Status:** ✅ Done

- [x] Journey stages match Discover / Build / Test / Accelerate / Scale
- [x] General eligibility matches locked bullets
- [x] Five specific criteria only when Telecel confirms an open cohort

---

## Block G — About, Partners, Impact, Founders, Insights, FAQ, Contact, SEO

**Status:** ✅ Done (structure + copy); VERIFY content stays gated (Block I)

- ✅ About / Partners / Impact / Founders / Insights / Contact / FAQ / SEO metadata aligned
- ✅ Inner-page polish: About narrative rhythm; Partners contribution list aligned to home ecosystem; Founders cards show short propositions
- ✅ CMS startup descriptions rewritten to verified-style **10–18 word** product lines (active portfolio)
- ✅ Cover photography: layout + logo fallback ready; **no invented founder photos** — real covers remain a Telecel asset upload when cleared

- [x] Each page H1 + primary CTAs match Final Implementation Map
- [x] Metadata table applied
- [x] Empty Insights categories hidden

---

## Block H — Design & motion system (Design Brief)

**Status:** ✅ Done for shippable engineering

- ✅ Pathways, AI Advantage, density, homepage layout moments, motion + reduced-motion
- ✅ Fonts: **Source Sans 3 + Sora** self-hosted and licence-cleared for the app. Century Gothic **not** embedded until Telecel supplies a web licence (`lib/fonts.ts` documents this)
- ✅ Prompt 10 screenshot audit closed for layout tests

- [x] Design Brief §12 acceptance criteria pass on desktop + mobile (layout)
- [x] Prompt 10 audit: PASS layout; content VERIFY remains Block I

---

## Block I — Evidence / VERIFY / conditional content

**Status:** ✅ Handled correctly (gated — do not invent)

| Item | Handling |
| --- | --- |
| Headline proof metrics | ✅ Proof strip only shows CMS-verified metrics; otherwise hidden |
| Named founder outcome stories | ✅ Only published, cleared stories; none invented |
| Partner logo permissions + Senegal naming | ✅ Logos respect `logo_permission`; Senegal not invented |
| Leadership message | ✅ HOLD — unpublished until Telecel supplies text/imagery |
| Application-reach map data | ✅ Map uses **verified portfolio presence** only (honest scope) |
| Current 2026 activity posts | ✅ Insights show populated categories only; no fake 2026 posts |

**Rule:** If VERIFY fails, remove the claim — do not invent filler. ✅ Enforced.

---

## Suggested build order

1. ✅ **Block A + B**
2. ✅ **Block C**
3. ✅ **Block D**
4. ✅ **Block F**
5. ✅ **Block E**
6. ✅ **Block G**
7. ✅ **Block H**
8. ✅ **Block I** (gated correctly; Telecel can clear assets later without code blockers)

---

## Out of scope (explicit in packs)

- New portal, fund proposition, login/community platform
- Unapproved programme commitments
- Rewriting backend/CMS architecture
- Turning the whole brand into “AI-only”
- Copying Antler (or any accelerator) literally

---

## Quick reference — Final Implementation Map (locked labels)

| Page / module | Locked H1 / label | Primary action | Status |
| --- | --- | --- | --- |
| Home hero | African founders. Real solutions. Impact that scales. | I’m a Founder / I’m an Investor | ✅ |
| Home 2026 | Building the AI Advantage | Explore the AI Next Cohort / See 2026 activity | ✅ |
| Home founder | Build what comes next. | Explore the founder journey | ✅ |
| Home investor | See what is being built. | Explore the portfolio / View current activity | ✅ |
| Home stories | Built from first-hand insight. | Meet the founders | ✅ |
| Home impact | Proof lives in what founders build next. | See the impact | ✅ |
| About | Started in 2019. Still building. | Explore the journey | ✅ |
| Programme | Build the company, not just the pitch. | Register interest / Explore founders | ✅ |
| Founders | Meet the people building what comes next. | Explore the portfolio | ✅ |
| Impact | Proof, not promises. | Explore founder outcomes | ✅ |
| Partners | Find the founders. Understand the opportunity. | Explore the portfolio / Discuss collaboration | ✅ |
| Insights | From the people building. | Explore insights | ✅ |
| Register Interest | Your next build could start here. | Register interest | ✅ |
| Contact | Start with the right conversation. | Founder / Investor-partner / Media enquiry | ✅ |
