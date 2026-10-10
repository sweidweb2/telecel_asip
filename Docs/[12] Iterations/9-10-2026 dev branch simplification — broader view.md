# Can this branch be simplified with a broader view?

**Date:** 9 October 2026  
**Branch:** `dev` (2 commits ahead of `main`: `57c6ba9`, `7567645`)  
**Scope:** Public navbar (Founders menu) and the dead-code cleanup in those commits. CMS admin features were not the change.  
**Method:** Read the branch against the surrounding nav, labels, About page, and tests. No code was changed.

## Answer

**Yes.**

The cleanup already removed a lot of unused code. About still compiles: `StoryStatCounter` was not deleted. What is left is a Founders menu that is hardcoded inside the navbar instead of described once with the rest of the links.

Do not replace `DropdownMenu` with another menu primitive. Do not split the header into server and client islands as the first step. The simpler shape is one nav tree that both the desktop row and the mobile sheet render.

## What this branch already simplified

Leave this in place.

| Change | Why it should stay |
| --- | --- |
| ✅ `<details>` Founders menu became `DropdownMenu` with `modal={false}` | Outside click, Escape, and keyboard behavior come from the existing menu primitive. `SiteAccountMenu` already uses the same primitive. |
| ✅ `components/ui/navigation-menu.tsx` deleted | A two-link menu does not need a second menu system. |
| ✅ Deprecated `updateSiteSettings` and `updateSiteSettingsSchema` removed | Callers already use the editor and admin actions. |
| ✅ Unused files removed: FAQ scroller, marketing `page-shell`, `founder-spotlight-card`, page skeletons, map types, `hooks/use-unsaved-changes-guard.ts` re-export | Nothing else imported them. |
| ✅ `StoryStatsNotice` removed from `story-stat-counter.tsx` | Nothing imported it. `StoryStatCounter` stayed, and About still renders it. |
| ✅ Admin reflection copy no longer names deleted helpers | The notes now describe what the public site actually does. |

---

## Findings

Each block is one finding. Severity is how much it costs to leave it. ✅ means checked and already done.

### ✅ About still compiles

| | |
| --- | --- |
| **Severity** | High |
| **Status** | ✅ Done. No code change. |
| **Where** | `components/marketing/story-stat-counter.tsx` still exports `StoryStatCounter`. `about-our-story-section.tsx` imports it and renders it. |
| **Broader view** | The branch removed only `StoryStatsNotice`. Nothing imported that helper. |
| **What happens** | `/about` compiles. The stat grid is still on the story section. |

### 1. Founders and Alumni are a special case on a flat link list

| | |
| --- | --- |
| **Severity** | Medium |
| **Where** | `components/layout/site-nav-labels.ts` (`EN_NAV`, `FR_NAV`) builds one flat `items` array. `components/layout/site-navbar.tsx` (lines 222–269) then filters Alumni out and, only when the href is Founders, renders a dropdown. |
| **Broader view** | Desktop and mobile do not share a structure. Desktop nests Directory + Alumni under Founders, and marks Founders active on `/alumni`. The mobile sheet maps `labels.items` as peer links, so Alumni is a normal row. The next nested item would add another `if` in the map. |
| **Simpler shape** | One tree in the labels module. A link is either a leaf or a parent with children. The navbar maps that tree: parent becomes `DropdownMenu` on desktop and a short group in the sheet; leaf stays a link. Drop `foundersHref`, the Alumni filter, and the `if (item.href === foundersHref)` branch. |
| **Keep** | `DropdownMenu` for the desktop parent. The tree replaces the special case. It does not replace the primitive. |

### ✅ 2. Menu copy is split between the labels file and the navbar

| | |
| --- | --- |
| **Severity** | Medium |
| **Status** | ✅ Done. |
| **Where** | `SiteNavLabels.masthead` and `SiteNavLabels.foundersDirectory` in `site-nav-labels.ts`. The Alumni dropdown child reads `labels.items`. |
| **Broader view** | English and French chrome copy now lives with the rest of the nav labels. The navbar no longer branches on `locale` for these strings. |
| **What happens** | A translation change in the labels module updates the masthead, the directory item, and the Alumni item together. |

### ✅ 3. English and French nav are two lists that must stay in lockstep

| | |
| --- | --- |
| **Severity** | Low |
| **Status** | ✅ Done. |
| **Where** | `HEADER_NAV_SLUGS` and `HEADER_NAV_LABELS` in `site-nav-labels.ts`. Footer groups stay in `site-footer-labels.ts`. |
| **Broader view** | Header order is one list. Each locale only supplies labels. Adding a header page is one slug plus two labels. |
| **What happens** | English and French header links cannot drift in order. Footer Explore / Programme / Contact stay separate. |

### ✅ 4. Navbar props and label fields nothing reads

| | |
| --- | --- |
| **Severity** | Low |
| **Status** | ✅ Done. |
| **Where** | `startupYears` is gone from `SiteNavbarProps`. `brand` is gone from `SiteNavLabels`. Footer `labels.brand` and the home hero brand are separate and stay. |
| **What happens** | The navbar contract is only `locale` and `labels`. The logo remains the header brand. |

### ✅ 5. The whole header is a client component

| | |
| --- | --- |
| **Severity** | Low |
| **Status** | ✅ Done. Left as one client component. |
| **Where** | `site-navbar.tsx` stays `"use client"`. |
| **Broader view** | The sheet and `DropdownMenu` need the client boundary. Splitting a server header plus two islands would add files without a measured bundle win. |
| **What happens** | No split. Revisit only if a bundle measurement says the header JS matters. |

### ✅ 6. Alumni tests query a link role the menu does not expose

| | |
| --- | --- |
| **Severity** | Low |
| **Status** | ✅ Done. |
| **Where** | `openFoundersMenu` in `e2e/public-site.spec.ts`. Alumni is queried as a `menuitem`. |
| **Broader view** | `DropdownMenuItem` with `render={<Link />}` is a menuitem, and the menu content is portaled outside `header`. |
| **What happens** | Both desktop tests open the menu through one helper. The outside-click test still checks that the menu closes. |

---

## Do not change

- Do not bring `NavigationMenu` back for two links.
- Do not build a CMS-driven public nav. These routes are fixed pages.
- Do not fold the footer groups into the header tree. They answer different questions (where to go vs legal / contact).
- Do not move the desktop link row from `md` to `lg` as part of this simplification. The sheet is `md:hidden`, and the tablet test at 900px expects the link row and no Menu button. The responsive rule says desktop links start at `lg`. That disagreement is a product choice, not a code cut.

## If this is implemented later

1. Replace the Founders `if` with a nav tree. Masthead, directory, and Alumni copy already live on `SiteNavLabels`.
