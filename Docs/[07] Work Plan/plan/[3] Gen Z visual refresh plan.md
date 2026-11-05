# ASIP visual refresh: "Same ASIP, more energy"

Status: plan, not started. Branch: `design/genz-refresh-plan`. Written 5 November 2026.

**Goal:** make the public site feel more current and appealing to a Gen Z audience (founders roughly 18–28, plus the people who share founder content), without changing the concept, the brand colors or the content the client just approved.

**Rule of thumb:** someone who knows the current site should recognize it immediately. Someone new should feel it's alive, confident and made for them.

---

## 1. What stays (guardrails)

| Keep | Why |
|---|---|
| Deep ink `#14333b` as the anchor color, cream canvas, teal and coral roles | This is the ASIP identity, and the client approved it |
| The four-to-five color spectrum as the brand signature | It comes straight from the logo ring |
| Sora for headings and Source Sans for body | Both are modern; we push how they're used, not which fonts |
| Real founder photography and the cohort film | Real people are the strongest Gen Z signal |
| The page structure, section order and all approved copy (EN and FR) | Nothing the client signed off on gets rewritten |
| The diagonal section cuts, kite sketch and stair motif | They're distinctive. We sharpen them, not remove them |
| Investor and Startup as the two pathways | This was just delivered |

## 2. What reads "not Gen Z" today

From a full walk-through of the home page at 1280px:

1. **Muted everything.** The palette is used at low intensity: mint tints, cream, grey-green borders. The logo's own colors are brighter than anything on the page. The logo has a **sun yellow `#efd640`** and a **sky blue `#1481c4`** the site never uses, and its green (`#80c451`) and red (`#e93343`) are punchier than the site's `#81b764` and `#dc395f`.
2. **Quiet type.** Headlines are large but uniform. There's no emphasis inside a headline, eyebrows are tiny letter-spaced caps (very "annual report"), and body copy is 16px grey.
3. **Corporate grids.** For example, the six ecosystem roles are an evenly ruled 3×2 table with icons, which reads like a consulting deck.
4. **Few moments of play.** Motion is limited to fade-and-slide reveals. Nothing reacts to the cursor or a tap, and nothing moves on its own except the hero slideshow.
5. **Desktop-first actions.** On a phone, the Investor | Startup choice scrolls away. Gen Z traffic is mostly mobile and comes from social links.
6. **Some contrast issues**, worth fixing regardless:
   - White on teal `#179191` is **3.82:1**, which fails WCAG for normal text. The header "Register interest" button uses it.
   - White on coral `#dc395f` is **4.38:1**, also a fail for normal text.

## 3. The direction in six moves

### Move 1: Color, retuned rather than replaced
Same roles and same 60/30/10 balance, with more saturation, plus the two missing logo colors used as small accents only.

| Token | Now | Proposed | Note |
|---|---|---|---|
| `--asip-ink` | `#14333b` | `#14333b` (unchanged) | anchor |
| `--background` (canvas) | `#fbfaf6` | `#fbfaf6` (unchanged) | |
| `--brand` (teal) | `#179191` | `#179191` for graphics, **`#117f7f` for text and buttons** | white on `#117f7f` = 4.81:1 ✅ |
| `--asip-coral` (CTA) | `#dc395f` | **`#d42f57`** | white text 4.83:1 ✅. Shifts slightly toward the logo red |
| `--brand-mid` (green) | `#81b764` | **`#80c451`** (logo green) | ink text on it 6.34:1 |
| `--asip-magenta` | `#c14a9b` | `#c0499b` (logo, same) | |
| `--asip-mint` | `#9ad1bf` | `#9ad1bf` (unchanged) | |
| **new** `--asip-sun` | none | **`#efd640`** (logo yellow) | highlights, stickers, ink text on it 9.17:1 |
| **new** `--asip-sky` | none | **`#1481c4`** (logo blue) | graphics and illustrations only, not for small text |

How each color is used:
- **Spectrum as a living element.** The 4-segment bar already in the hero becomes the system's signature: a thin animated spectrum line under the nav, on section dividers, on card hover outlines, on the active nav item, and as the focus ring. It always appears in logo order.
- **Sun is the "highlighter".** One word per hero or section headline gets a sun marker stroke behind it, for example "Built to **scale**." No structural change.
- **No gradients over photos, no neon.** The colors get louder in small doses, never as page washes.

### Move 2: Type with attitude
- **Display sizes go up one step** and use tighter leading and tracking (Sora 600–700, `tracking-[-0.03em]`, leading 0.95–1.0) for the hero and section titles.
- **Emphasis inside headlines:**
  - the sun highlighter (Move 1), or
  - one word set in the outline or teal variant.
  - Applied through a tiny `<Emph>` wrapper, so the copy files only gain markers like `"Built to [scale]."`, not new text.
- **Eyebrows become stickers.** The tiny letter-spaced caps become small rounded pills: ink text on mint or sun, sentence case, slight -2° rotation on hero and section openers only. Uniform in admin.
- **Body copy:** 17–18px on marketing pages, darker (`muted-foreground` from `#52666b` to around `#3f5257`), and max line length about 62ch.
- **Numbers as stickers:** stats ("11 ventures", "4 cohorts") set huge in Sora with a colored underline.

### Move 3: Shape and surface
- **Radius scale up:** cards go to 20–24px (`--radius` 0.5rem → 0.75rem on marketing only). Buttons stay pill-shaped.
- **"Neo-brutal lite" on primary actions only:** the coral CTA gets a 2px ink border and a 3px offset ink shadow that collapses on press. That's the tactile feel Gen Z associates with modern apps, used sparingly. Outline buttons stay soft.
- **Bento grids instead of ruled tables:** the ecosystem roles, platform model and outcomes become bento cards of mixed sizes. One big card has a photo, the others get an icon on a colored chip. It's the same content in a different layout.
- **Subtle film grain** on the dark ink panels (a 2–3% noise PNG, about 4kb) for warmth. The hero and footer already lean this way.
- **Sticker accents:** small rotated badges for tags such as "2026 cohort", "Women-led", "AI", "Working theme". They're reusable and replace the current dashed tag.

### Move 4: Motion and micro-interaction (respects `prefers-reduced-motion`)
- **Springy hovers:** cards lift 4px and tilt slightly, CTAs squash on press, and arrows nudge. These are CSS only, with a single easing token (`cubic-bezier(.34,1.56,.64,1)`).
- **Marquee ticker:** one slow strip of countries, sectors and founder names ("Ghana · Agritech · Senegal · Fintech · …") between the cohort film and the impact section. It's built from existing data. The keyframes already exist in `app/globals.css` (`--animate-scroll-horizontal`), but no component uses them yet.
- **Count-up stats** when the impact numbers scroll into view.
- **Spectrum line draw:** section dividers draw in their colors on scroll, using the existing `animation-timeline: view()` setup in `marketing.css`.
- **No scroll-jacking** and no heavy JavaScript animation libraries. Everything is CSS or IntersectionObserver.

### Move 5: Founder-first presentation (no copy changes)
- **Faces before facts:** founder cards lead with a portrait, a name and a one-line "what they're building". Logos go secondary.
- **"Reels" strip:** if we have short clips from the cohort film, show 3–5 vertical cards (9:16, muted, autoplay on hover or in view) on home and Founders. Without clips, use portrait stills with a play-style frame and link to the film.
- **Quote cards:** founder-story pull quotes as large colored cards (mint, sun or blush), screenshot-friendly so people share them.
- **Shareable proof:** Open Graph images per founder and story, using the same sticker language, so links shared on WhatsApp, LinkedIn and X look designed.

### Move 6: Mobile-first actions
- **Sticky bottom bar on mobile:** "I am: [Investor] [Startup]" appears after the hero scrolls away and hides near the footer, so the two pathways are always one tap away.
- **Swipe carousels** with snap points for insights, founders and outcomes. The insights carousel exists; we extend the pattern.
- **Thumb targets at least 48px**, and the nav menu as a full-screen sheet with big type and the spectrum bar.

## 4. Section by section (home first)

| Section | Change |
|---|---|
| Nav | Spectrum hairline under the bar. Register CTA moves to `#117f7f` (contrast fix), or coral with the offset shadow. Logo size check, since the new round mark reads small at 56px |
| Hero | Sun highlighter on "scale", sticker eyebrow ("2026 applications open soon"), coral CTA with offset shadow, Investor | Startup unchanged in function |
| Cohort film | Rounded 24px frame, play button becomes a big sun disc, marquee ticker below |
| Impact years | Count-up numbers, stat stickers |
| Platform model | Bento layout, spectrum-colored step numbers |
| Outcomes ("The story is what happened next") | Photo-led bento with a quote card |
| Ecosystem | Bento grid instead of the 3×2 ruled table. "Explore Partnership Opportunities" stays as is |
| Telecel connection | Grain on the ink panel, spectrum divider |
| 2026 cohort | "AI Advantage in Action" becomes a sticker. The eligibility checklist gets colored check chips. Investor | Startup stay |
| Latest insights | Taller cards with an image on top, category sticker, swipe on mobile |
| Footer | Big type line ("African founders. Built to scale.") larger, spectrum bar on top |

**Other pages** reuse the same components, so they pick up the changes through shared parts: `page-elements.tsx`, `tree-centered-hero.tsx`, the cards and the CTAs. Founders and Insights get the founder-first and swipe treatments, Program gets bento and stickers, and the forms get bigger inputs and friendlier focus states.

**Admin and editor portals stay unchanged.** They already override tokens under `[data-staff-shell]`, and the new tokens are scoped to marketing.

## 5. Engineering plan

**Phase 0: tokenize, with no visual change. ✅ Done on 5 November 2026.**
- Changed 219 color values in 37 files under `components/marketing`, `components/layout` and `app/[locale]`:
  - Tailwind classes and SVG attributes now use the theme tokens.
  - The ink-colored `rgba(...)` values in gradients and shadows now use `color-mix(in srgb, var(--token) N%, transparent)`.
- New tokens: `--asip-ink-raised` `#1a3f48`, `--asip-ink-deep` `#0f282e`, `--asip-ink-night` `#0b1c22` and `--asip-sand` `#f5e6b8`.
- Verified with no visible change. I compared computed colors for every element on 12 pages (EN home, About, Program, Founders, Impact, Partners, Insights, Contact, Register Interest, FAQ, Alumni and FR home) before and after, at the pixel level, and found 0 differences.
- Left as hard-coded on purpose. These are one-off shades that Phase 1 will derive from tokens:
  - gradient middle stops in `institutional-hero-field.css`,
  - the stair tints in `home-impact-growth-illustration.tsx`,
  - illustration accents in `cta-startup-illustration.tsx`,
  - the decorative window dots.

Original description:
The marketing components hard-code colors about 200 times: `#14333b` 82×, `#9ad1bf` 35×, `#179191` 32×, `#81b764` 12× and others. Replace them with token classes (`bg-asip-ink`, `text-asip-mint`, …). After that, retuning the palette is a change in `app/globals.css` only. Before-and-after screenshots should be identical.

**Phase 1: foundations (1 day).**
- New and retuned tokens in `globals.css`, scoped to marketing via `[data-marketing]`, so the admin portal is untouched.
- Type scale, the radius bump, the `--ease-spring` token.
- Components: `Emph` (highlighter), `Sticker`, the `SpectrumLine` divider, and the CTA offset shadow in `coralCtaClassName`.

**Phase 2: components (1–2 days).**
- Bento card grid, quote card, stat sticker with count-up, marquee strip, mobile sticky pathway bar.
- Founder card refresh, insight card refresh.

**Phase 3: apply to sections (2 days).**
- Home sections per the table above.
- Copy files gain optional emphasis markers (EN and FR), with no wording changes.

**Phase 4: polish and QA (1 day).**
- Contrast check for every text and background pair (target AA 4.5:1, or 3:1 for large text).
- `prefers-reduced-motion` turns off marquee, tilt, count-up and line-draw.
- Lighthouse performance stays at or above the current score. Grain and marquee are CSS only, and there are no new JavaScript libraries.
- French layouts checked, since French runs about 15–20% longer.
- Visual check at 375, 768, 1280 and 1536px.

**Total: about 6–7 working days.** Each phase ships as its own PR off this branch, with screenshots so the client can approve.

## 6. How we get sign-off without a full rebuild
1. Build **the hero and one section (Ecosystem bento)** first, on a preview deploy.
2. Show the client a side-by-side of before and after for the same two sections.
3. Use one "dial" to calibrate how far to go: the sun highlighter plus offset-shadow CTA (bolder), or only the retuned colors and stickers (gentler). Lock it, then roll out to the rest.

## 7. Questions for the client
1. Is the **sun yellow** from the logo OK as a highlight color on the site? It's the biggest visible change.
2. Do we have **short founder clips** (vertical, 10–20s) for a reels strip, or can we cut them from the cohort film?
3. Should we keep the **"Working theme" tag** on "AI Advantage in Action", or is the theme final?
4. Does anything in Telecel Group's **brand guidelines** forbid offset shadows or rotated elements?
