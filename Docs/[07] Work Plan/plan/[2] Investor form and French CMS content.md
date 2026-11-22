# Investor form and French CMS content: plan

Status: **investor intake + admin inbox shipped** (Nov 2026). French CMS `*_fr` columns remain a separate workstream (§2).

---

## 1. Investor form — done

**Shipped approach:** shared signup account type `startup | investor`, then Register Interest / Apply branching (not Option B’s dedicated `/investors` page).

| Piece | Status |
| --- | --- |
| Tables `investor_interests` / `investor_engagements` + RLS | Done (`20261110210000`) |
| Public forms + validations + submit actions | Done |
| Home Investor CTA → register-interest (gated → apply when open) | Done |
| Privacy / terms / FAQ copy | Done |
| Admin inboxes (list, status, edit, delete, CSV) | Done |
| Nav badges + list stats + analytics pipelines | Done (`20261122070000`) |
| Backup allowlist | Done |
| Admin E2E | Done (`e2e/investor-*.spec.ts`) |

**Not built (optional polish):** dedicated `/investors` marketing page; post-login default for investors; email alerts (founders also have none).

---

## 2. French for CMS content

**Problem:** CMS content (blogs, founder stories, startups, partners, cohorts, impact metrics) is stored in one language, English. The French site shows that English text, so the client's request to translate all approved content into French isn't met for anything stored in the database.

### Recommended approach: French columns next to the English ones
For each table, add nullable `*_fr` columns for the public text fields only. Names, URLs, slugs and numbers stay shared.

| Table | French columns to add (proposed) |
|---|---|
| blogs | title_fr, summary_fr, body_html_fr, meta_title_fr, meta_description_fr |
| founder_stories | the text fields shown on the public story (e.g. headline_fr, the_asip_connection_fr, …) |
| startups | description_fr, plus tagline or problem fields if they're shown |
| partners | contribution_fr (only if it's shown publicly) |
| cohorts | public_label_fr, summary_fr |
| impact_metrics | label_fr and description fields |

Check the exact column lists against `supabase/migrations` before writing the migration.

- **Migration:** add the `*_fr` columns (nullable), copy each table’s length checks to its `_fr` twin, and add the new columns to the public views (`partners_public` and the others) so the anonymous role can read them.
- **Reading:** in the data layer (`data/*.ts`), when `locale === "fr"` use the `_fr` value and fall back to English if it's empty. Do this in one helper (`pickLocalized(row, "title", locale)`) so pages don't change.
- **Caching:** the cache keys that are currently shared across locales (for example `getPublicPartners`, "one cached read serves both locales") need to include the locale, or pick the language after the cached read.

This section is unchanged and still **not started**.
