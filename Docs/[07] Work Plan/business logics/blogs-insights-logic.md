## Blogs / Insights Logic

### Overview

Public **Insights** content is stored in `public.blogs`. Admins create and edit posts in the CMS; only **published** posts appear on the marketing site (`/en|fr/insights` and detail slugs).

There is one content type for articles and case studies — not separate tables.

---

### Categories (streams)

`blogs.categories` is a `text[]`:

1. **At least one** category is required.
2. The **first** entry must be one of the five ASIP streams:
   - Founder Stories
   - Portfolio News
   - Programme Updates
   - Founder Resources
   - Partner Perspectives
3. Extra free-text tags are allowed after that (up to 8 total).

Listing tabs on Insights filter by these stream labels (first category drives stream identity for new CMS writes).

---

### Related records (optional FKs)

| Column | Points to | Role |
| --- | --- | --- |
| `startup_id` | `startups.id` | Optional link to a founder/startup the article is about |
| `cohort_id` | `cohorts.id` | Optional link to a programme cohort |

- Both nullable; **ON DELETE SET NULL** (deleting a startup/cohort clears the link, does not delete the blog).
- Set in the blog editor (**Related & SEO**): pickers load admin-readable startups and cohorts.
- Public detail can show a founder link and/or cohort label when set.
- Not a many-to-many join — at most one startup and one cohort per post.

---

### Sources & SEO fields

| Field | Role |
| --- | --- |
| `sources` | Repeatable text/URLs (citations); shown on public detail when present |
| `meta_title` | Optional CMS SEO title; `generateMetadata` prefers this, else post title |
| `meta_description` | Optional CMS SEO description; prefers this, else summary |

---

### Publishing rules

- **draft** — admin only; not listed publicly.
- **published** — visible on Insights; needs publish timestamp via write RPC.
- **Featured hero** — at most one featured published post at a time (enforced in `create_blog_with_featured` / `update_blog_with_featured`). Featured requires `status = published`.

Writes go through those RPCs (not raw table inserts from the app) so featured exclusivity and the new columns stay consistent.

---

### Newsletter (separate, Insights page)

Insights listing also hosts a newsletter module:

- Toggle: `site_settings.newsletter_signup_enabled` (**default false**).
- When off: UI shows inactive copy + disabled controls; `subscribeNewsletter` **hard-rejects**.
- When on: email + consent + Turnstile; rows land in `newsletter_subscribers` (DB only — no email/CRM delivery in this pass).

---

### Admin vs public surfaces

| Surface | Behaviour |
| --- | --- |
| CMS blog editor | Full fields in main column (content, Related & SEO, publishing); sidebar keeps cover + categories |
| Insights listing | Published posts; stream tabs; newsletter module (gated) |
| Insight detail | Body + optional related founder/cohort + sources; SEO from meta fields |
| Home “Latest” | Latest published insights feed (unchanged skeleton) |
