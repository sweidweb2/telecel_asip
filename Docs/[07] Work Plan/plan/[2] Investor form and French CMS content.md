# Investor form and French CMS content: plan

Status: proposal, not started. Written 3 November 2026 for the client revision round (see `Docs/[11] Their Edits/2-11-2026 client revisions summary.md`).

---

## 1. Investor form

**Goal:** the home page **Investor** button opens a form for investors, not the founders directory.

### What exists today
- `interest_registrations` and `applications` are founder intakes: company, sector, pitch, and so on.
- `contact_messages` is a general contact form. Its "partner" route covers "corporate, investor, technology, development or ecosystem collaboration", but it stores only name, email, phone, subject and message, so investor details end up as free text.

### Option A: quick interim (no database change)
Point Investor to the contact page with the partner route preselected (`/contact?route=partner`). This needs a small change so the contact page reads the `route` query parameter. It can ship the same day, but investor submissions stay mixed in with other partner messages.

### Option B: dedicated investor form (recommended)
Give investors their own page, `/investors` (`/fr/investors`), with a short form and a dashboard inbox.

**Database (one new migration):**
```sql
create table public.investor_interests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  organization text not null,
  investor_type text not null,      -- angel | vc | corporate | dfi | family_office | other
  ticket_size text,                 -- range label, e.g. "50k-250k"
  stages text[] not null default '{}',   -- pre-seed | seed | series_a | growth
  sectors text[] not null default '{}',
  countries text[] not null default '{}',
  message text,
  consent boolean not null check (consent = true),
  locale text not null default 'en',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.investor_interests enable row level security;
-- anon: insert only (through the server action); staff: select/update, same policies as interest_registrations.
```
It mirrors how `interest_registrations` is set up: row level security, insert through a server action, the same rate limiting and Turnstile check, and a length check on each text column.

**App work:**
1. `validations/investor-interest.ts`: zod schema plus tests.
2. `actions/submit-investor-interest.ts`: server action using the same rate limit and Turnstile check as Register Interest.
3. `app/[locale]/(marketing)/investors/page.tsx` plus `components/marketing/investor-form.tsx`, with English and French labels in a labels file.
4. Dashboard: an "Investors" inbox list and detail view, an unread count in the nav, and export. Copy the interest registrations screens.
5. Point `pathways.investor` in `constants/home-copy.ts` to the new `investors` slug, and add the slug to `constants/public-pages.ts` and the sitemap.
6. Privacy policy: add investor submissions to "What we collect".

**Decisions for you and your co-founder:**
- Which fields are required? Ticket size and stages are the usual minimum for screening.
- Who gets notified? The site sends no emails today, so new submissions only appear in the dashboard inbox.
- Should investors also be able to browse founders from the form page, for example with a "See the founders" link?

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

- **Migration:** add the `*_fr` columns (nullable), copy each table's length checks to its `_fr` twin, and add the new columns to the public views (`partners_public` and the others) so the anonymous role can read them.
- **Reading:** in the data layer (`data/*.ts`), when `locale === "fr"` use the `_fr` value and fall back to English if it's empty. Do this in one helper (`pickLocalized(row, "title", locale)`) so pages don't change.
- **Caching:** the cache keys that are currently shared across locales (for example `getPublicPartners`, "one cached read serves both locales") need to include the locale, or pick the language after the cached read.
- **Editing:** add a French tab or section to each CMS editor form, plus validation for the French fields.
- **Translation:**
  - I draft French for all existing rows. That's about 4 blogs, 3 founder stories, about 50 startup descriptions, the partners and the cohorts.
  - A native speaker reviews the drafts.
  - We load them with a one-off script, after taking a backup, the same way as the American English update.
- **Order of work:**
  1. Migration on a branch, tested against a copy of the database or Supabase branching, not production first.
  2. Data layer and fallback.
  3. Editor forms.
  4. Translations.
  5. Apply to production.

**Effort:** the migration and data layer are about a day. The editor forms take another one to two days, mostly repetitive. Translation drafts are quick to produce, but the review time is up to the client.

### Alternative: a single translations table
A single `content_translations(table, row_id, field, locale, value)` table is more flexible, but every query needs extra lookups and the editor UI gets harder. It isn't worth it for two languages.

---

## Production database safety (both items)
- Every schema change goes in as a migration file in `supabase/migrations`, reviewed in a PR first, never typed straight into the dashboard.
- Back up the affected tables before any data update. The American English update used the same approach: `cms-backup-before-update.json`.
- The service role key and database password were shared in chat on 3 November 2026. Rotate them before or alongside this work.
