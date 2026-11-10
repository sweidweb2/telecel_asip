# ASIP v2 compliance audit, 9 November 2026

Checked page by page against:

- **Final Text Pack & Sitemap v2.0** (08.11.2026): words, sitemap, content states.
- **Final Design & Audience Experience Brief** (08.11.2026): UX, visual system, motion.

Status key: **Done** = implemented and verified in the browser · **Partly** = implemented, with a gap noted · **Open** = needs Telecel data, a decision, or a later pass.

---

## Text Pack v2, page by page

| Pack page | Item | Status | What the site does now |
|---|---|---|---|
| 1 | British English, "Program" only in the logo lock-up | **Done (English)** | All public English copy converted (programme, organisation, enquiry, commercialisation, recognises). The lock-up "Africa Startup Initiative Program / A Telecel Group Program" is kept. This reverses the 6 Nov American-English revision, because v2 supersedes it. |
| 2 | No internal notes, empty shells, "coming soon", or inferred facts | **Done** | Removed: FAQ answer that described the navbar, Impact "[Startup] entered ASIP…" template, three "coming soon" story cards, "[Founder]" example headlines on Insights, About leadership placeholder label, Programme cohort-specific criteria. Empty case studies, insights and proof strip now hide instead of showing a shell. |
| 2 | Register Interest is the default; "Apply" only when switched on | **Done** | Every founder CTA reads the CMS `open_applications` switch. Nothing is scheduled to open by date. |
| 3 | Sitemap and nav labels | **Partly** | Nav: Home, About, Programme, Founders, Impact, Partners, Insights, plus a Register Interest / Apply button. **Alumni removed from the nav** (HOLD). URL is still `/program`, not `/programme` (see Open items). `/#founders` and `/#investors` anchors exist. |
| 4 | Voice: no "connect" filler, no em dashes, no exclamation marks | **Done** | Spaced hyphens used as dashes replaced in public strings. "Connecting Energies" appears only in the About Telecel block, as a brand reference. Investor "deal flow" wording removed. |
| 5 | Header, founder status, footer | **Done** | Open-state banner: "Applications are open." Footer: "Built around African founders. Backed by Telecel Group." with the v2 sentence. Footer buttons are now "Explore founders \| Contact ASIP"; links include Partners; legal links read Privacy, Terms, Cookie preferences. |
| 6–8 | Home modules 01–11 | **Done** | Built in the previous step, in v2 order with v2 copy. See the Design Brief section below. |
| 9–10 | About | **Done** | "Started in 2019. Still building." with the Barcelona origin. v2 story, mission, vision and Telecel relationship. Journey: 2019, 2021–2024, 2025 Portfolio Support Year, 2026 Building the AI Advantage. Leadership message stays unpublished. The "Belief" heading is shown, but its body copy has no slot in the current layout. |
| 11–12 | Programme | **Done** | v2 hero, new **2026 direction block** ("AI that earns its place in the business."), "Who it is for", journey Discover > Build > Test > Accelerate > Scale, six "What founders gain" items, six **general** eligibility points. The cohort-specific criteria (woman on the team, existing revenue, full-time founder) are removed until a cohort is confirmed. |
| 12–13 | Founders and portfolio | **Partly** | Hero and directory introduction use v2 copy. **Open:** CMS startup descriptions are long pitch paragraphs with unverified claims; v2 wants a verified 10–18 word line. This is CMS content work. Priority proof stories (Herconomy, Moja Ride and others) are not published, pending VERIFY. |
| 14 | Impact | **Done** | "Proof, not promises." The impact lenses show framing only (evidence requirements are not public copy). Evidence rule uses the FAQ wording. **Removed the "Founders building traction" section**, which hard-coded unverified revenue and usage figures (for example "Mojaride over 4.4M tickets"; the pack's source says 1.3M). |
| 15–16 | Investors and partners | **Done** | "Find the founders. Understand the opportunity.", the "Built for informed engagement." investor block, the six-row partner contribution model, and partner-proof copy naming the eight partners. **Open:** logo permissions; Government of Senegal is not listed. |
| 16 | Insights | **Done** | Page heading "From the people building."; categories "Founder & Portfolio Stories" (founder stories plus portfolio news) and "Programme Updates". Founder Resources and Partner Perspectives only appear when they have articles. Article chips show the v2 category name. |
| 17–18 | Register Interest / Apply | **Done** | v2 copy for both states. Apply shows the six-step application journey. Form fields match the pack; the optional long-form "pitch" box is removed from Register Interest. |
| 18–19 | Contact and FAQ | **Done** | "Start with the right conversation." Routes: Founder enquiry, Investor / partner enquiry, Media enquiry, General enquiry, with v2 microcopy. FAQ uses the 11 final answers word for word; no duplicates are shown. |
| 19 | SEO metadata | **Done** | Home, About, Programme, Founders, Impact, Partners, Insights and Register Interest use the v2 titles and descriptions. |
| 21 | Sensitive narrative controls | **Done** | 2025 is a Portfolio Support Year, with no cohort implied. 2026 is not shown as open. No fund, valuation, Bloomberg or alumni claims. |
| 23 | Publication checklist | **Partly** | Every item that code controls passes. Open items are below. |

## Design Brief, section by section

| Brief section | Status | Notes |
|---|---|---|
| 01 Mandate / 02 Audiences | **Done** | Founder and Investor are the only two hero actions; both are visible above the fold on desktop and in the first mobile screen (checked at 1440×900 and 375×812). |
| 03 Homepage order | **Done** | Hero > AI Advantage > proof > founder/investor > stories > impact > map > ecosystem > insights > close. |
| 04 AI Advantage | **Done** | Directly below the hero, using a real event photo with a light data panel. No AI clichés. Also reused on Programme for the 2026 direction. |
| 05 Visual system | **Partly** | Multicolour leads (magenta, sky, green, yellow); red is limited to CTAs. **Open:** Century Gothic licence and font loading not yet confirmed. |
| 06 Page-by-page | **Partly** | Copy and structure updated on every page. Visual restyling of inner pages (About build-log, Founders card rhythm, Partners layout) has not been done yet. |
| 07 Interaction and motion | **Done (homepage)** | Short CSS motion (200–500 ms), map tap/hover, smooth anchors; all off under reduced motion. |
| 12 Acceptance criteria | **Partly** | See Open items. The Prompt 10 screenshot audit has not been run yet. |

## Open items (need Telecel or a decision)

1. **Metrics:** 10,000+, 50+, 40+, 70% and $50M+ are all VERIFY. The proof strip stays hidden until they are marked verified in the CMS.
2. **Application-reach data** for the map, by country. Today the map shows portfolio presence only.
3. **Founder imagery and one-line propositions**, verified, for every published startup.
4. **Partner logo permissions**; the official Government of Senegal entity name.
5. **URL `/program` → `/programme`:** needs a route rename and a 301 redirect. Not done, to avoid changing a live URL without sign-off.
6. **American vs British English:** the 6 Nov revision asked for American English, and v2 requires British. v2 has been applied; confirm with the client.
7. **French:** every public page (Home, About, Programme, Founders, Impact, Partners, Insights, Register Interest / Apply, FAQ, Contact, nav, footer, metadata) now mirrors the v2 English structure. The pack supplies no French copy, so these are working translations and should get a native-speaker review before launch.
8. **Century Gothic** web licence.
9. **Prompt 10 screenshot audit** and its top five fixes, plus the colour-rules note for the submission.
