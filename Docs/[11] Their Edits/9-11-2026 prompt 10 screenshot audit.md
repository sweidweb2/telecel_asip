# Prompt 10 screenshot audit: homepage, 9 November 2026

Run against the Final Design & Audience Experience Brief (08.11.2026), section 12 acceptance criteria. Desktop was checked at 1440×900 and mobile at 375×812, on the local build with the current CMS data.

## Four tests

| Test | Before fixes | After fixes |
|---|---|---|
| **Five-second founder test** | REVISE. The hero headline was still invisible about 1 s after load (intro animation), and the founder story cards were long pitch paragraphs under large letter placeholders. | **PASS.** The headline and both routes show within 1 s on desktop and mobile. AI Advantage is the next screen. Founder stories are short cards. |
| **Five-second investor test** | REVISE. No numbers anywhere: every headline metric is pending verification, so the proof strip is hidden. | **PASS (with data caveat).** The investor panel shows live counts from the published portfolio (42 companies, 12 markets). Cleared impact metrics still need Telecel sign-off. |
| **Corporate-pattern test** | REVISE. Founder stories were an oversized, text-heavy card grid (about 775 words). | **PASS.** Stories are now about 107 words. There are no red blocks; red is limited to buttons. The layouts vary: split pathways, numbered ecosystem list, tile map. |
| **AI Advantage test** | PASS. | **PASS.** Directly below the hero, uses a real event photo with a light data panel, and doesn't make the rest of the site AI-themed. |

## Acceptance criteria

| Criterion | Result | Evidence / note |
|---|---|---|
| Audience | **PASS** | Founder and Investor are visible above the fold (desktop) and in the first screen (mobile: buttons end at 684 px of 812). |
| Current relevance | **PASS** | AI Advantage is the second module. |
| Copy density | **PASS** | Hero support 33 words. Stories cut from about 775 to about 107 words. One-line cards are capped at 20 words. |
| Visual distinctiveness | **PASS** | Varied rhythm: photo split, colour split, editorial cards, tile map, numbered list. |
| Founder-first | **REVISE (content)** | The layout is founder-led, but no published startup has a cover photo yet, so cards are text-only. Needs approved founder imagery. |
| Investor credibility | **REVISE (content)** | Live portfolio counts are shown. Cleared metrics (10,000+, 50+, 40+, 70%) are still pending. |
| AI treatment | **PASS** | Practical, uses a real photo, no clichés. |
| Brand | **PASS** | Multicolour leads; Telecel red only on buttons. |
| Language | **PASS** | British English; no generic "connect". |
| Motion | **PASS** | Hero reveal now 400 ms (was 750 ms plus up to 460 ms delay). Reduced-motion fallbacks are in place. |
| Mobile | **PASS** | Hero buttons sit side by side in the first screen. The sticky route bar now lists Founder first and no label wraps at 375 px. No sideways scroll. |
| Quality | **REVISE (content)** | Some CMS one-liners are award text, not "what they are building". "What's happening now" shows past cohort recaps. |
| Factual discipline | **PASS** | No invented metrics. The Impact page's unverified revenue figures were removed earlier. Sector count dropped because CMS sector tags are inconsistent. |

## Five highest-priority corrections

1. **Founder stories were too dense.** *Fixed.* New compact homepage card: tags, company name, first sentence capped at 20 words, founder name, and the whole card clickable. Cards with photos come first. A text-only lead card no longer stretches into an empty block, and the grid fills without gaps.
2. **The hero intro delayed the proposition.** *Fixed.* The headline reveal went from 750 ms to 400 ms, with stagger delays of 40–180 ms (were 180–460 ms). The spectrum bar now starts immediately.
3. **Investors saw no proof.** *Fixed within data limits.* The investor panel shows live counts of published portfolio companies and markets. These are counts, not impact claims. Sectors were left out because CMS values mix combined tags.
4. **The mobile route bar contradicted the hero order and wrapped.** *Fixed.* Founder comes first, labels stay on one line, and the prompt text shows only on phones 430 px wide or more (the group keeps it as its accessible name).
5. **Content gaps no layout can fix.** *Open, needs Telecel.* These are founder cover photos, verified 10–18 word propositions, cleared headline metrics, application-reach data for the map, and current 2026 activity posts. Until these land, the founder-first, investor-credibility and quality criteria stay REVISE.
