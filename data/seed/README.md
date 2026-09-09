# ASIP source-backed seed datasets

This directory is the normalized seed package extracted from
`Docs/[05] Guy Data`. The data is separated by CMS entity, relationship,
content segment, provenance level, and media category so each concern can be
reviewed or changed independently.

No seed is executed by files in this directory. Database writes only happen
when a developer intentionally runs `npm run seed:asip-source`.

## Dataset map

| File | Records | Purpose | Database destination |
| --- | ---: | --- | --- |
| `index.json` | 1 | Package inventory and authoritative counts | None |
| `cms/startups.json` | 42 | Public-safe accelerator alumni/company profiles | `startups`, `startup_details` |
| `cms/cohorts.json` | 4 | Cohort identity, dates, status, summaries, and source reference | `cohorts` |
| `cms/partners.json` | 14 | Programme partners with approved local logo references | `partners` |
| `cms/events.json` | 4 | Source-backed Demo Day events | `events` |
| `cms/evidence-records.json` | 5 | Evidence entries shared by impact claims | `evidence_records` |
| `cms/impact-metrics.json` | 9 | Application and FY2025 portfolio metrics | `impact_metrics` |
| `relations/cohort-startups.json` | 43 | Explicit cohort-to-startup foreign-key relationships | `cohort_startups` |
| `relations/cohort-partners.json` | 8 | Confirmed core programme partners for each cohort | `cohort_partners` |
| `relations/event-startups.json` | 43 | Demo Day startup participation | `event_startups` |
| `content/programme-milestones.json` | 10 | Programme-history timeline content | Not yet backed by a CMS table |
| `provenance/startup-source-records.json` | 43 | Raw source text, pages, and source contact details | Never seeded; internal only |
| `provenance/cohort-source-records.json` | 4 | Application totals and source files removed from the strict cohort rows | Never seeded; internal only |
| `media/partner-logos.json` | 14 | Partner/sponsor logo source assets | File-backed manifest |
| `media/cohort-slides.json` | 8 | Cohort/FSD slide images | File-backed manifest |
| `media/event-media.json` | 37 | Event photography and video | File-backed manifest |
| `media/source-reports.json` | 23 | Reports and booklets used as evidence | File-backed manifest |

The package contains 42 unique companies and 43 cohort memberships because
Agrodata appears in both the Cohort 1 and Cohort 2 source materials. It is one
startup record with two relationship records, preventing duplicate companies
while preserving the source history.

## Folder responsibilities

### `cms/`

Contains records matching existing CMS concepts. Every file uses a small
versioned envelope with a `records` array. Missing values remain `null`; they
are not guessed. Natural keys such as `startup_key`, `partner_key`, `cohort_key`,
and `event_key` are seed-only identifiers and are not inserted as database
columns.

### CMS attribute coverage

| CMS entity | Seeded attributes |
| --- | --- |
| Startup | `name`, `slug`, `logo_url`, `description`, `status`, `founded_at` |
| Startup details | `website_url`, `industry`, `category`, `location`, `founding_year`, `team`, `size`, `problem`, `solution`, `target_market`, `business_model`, `funding_goal`, `amount_raised`, `cohort`, `country_code`, `sector`, `founder_names`, `cover_image_url`, `public_outcome`, `featured`, `image_focal_x`, `image_focal_y` |
| Cohort | `year`, `public_label`, `programme_dates_start`, `programme_dates_end`, `programme_status`, `summary`, `media_url`, `publish_status` |
| Partner | `name`, `org`, `type`, `contribution`, `is_active`, `logo_permission`, `logo_url`, `link`, `sort_order` |
| Event | `name`, `event_date`, `location`, `format`, `speakers`, `assets`, `outcomes`, `publish_status` |
| Evidence | `primary_source`, `source_file_url`, measurement dates, resolved `owner_id`, `status`, `last_verified_date`, `permission`, `review_date` |
| Impact metric | `claim_label`, `value`, `unit`, period dates, `geography`, `impact_lens`, `display_locations`, resolved `evidence_id`, `publish_status` |

The current CMS also contains users, registrations, applications, blogs,
founder stories, contact messages, settings, and backups. Those entities are not
seeded from these programme documents: the source material either does not
contain the required attributes, represents real user submissions, or lacks the
consent/quote fields needed for a valid record.

Cohorts use a stable `cohort_key` in the form `YEAR:PUBLIC_LABEL`. Impact metrics
use `metric_key` and reference evidence by `evidence_key`, keeping foreign-key
dependencies readable before database UUIDs exist.

### `relations/`

Contains natural-key foreign relationships separately from entity payloads.
During seeding, `cohort_key` and `startup_slug` are resolved to database UUIDs.
This makes membership review possible without opening either CMS dataset.

### `content/`

Contains useful website content that does not yet have a matching CMS table.
Programme milestones are ready for a future timeline/content-block migration,
but the current seeder does not force them into an unrelated table.

### `provenance/`

Contains the audit trail back to report pages, including source contact email
addresses and raw extracted text. Treat this directory as internal programme
material. The seeder does not read or insert it, and none of it should be sent
to anonymous/public views without an explicit privacy and permissions review.

### `media/`

Every image, video, logo, cohort slide, and source PDF is included in a media
seed manifest. Each record includes:

- `source_path`: repository-relative path to the original binary;
- `sha256`: deterministic duplicate and integrity check;
- `size_bytes`: original file size;
- `mime_type`: detected media type;
- `seed_role`: its website/media category.

The manifests contain 82 source-file records: 14 partner logos, 8 cohort
slides, 37 event-media files, and 23 report/booklet files. Several reports are
intentional duplicate copies; matching hashes make those duplicates clear.

The current database has no general-purpose media-library table, so the seed
script catalogs these files but does not upload or invent database rows for
them. Existing optimized selections remain in `public/partners` and
`public/asip-media`. When a media table or storage mapping is approved, these
manifests are the migration input and integrity source.

## Seed order and behavior

The seeder resolves dependencies in this order:

1. `cms/partners.json`
2. `cms/startups.json`
3. `cms/cohorts.json`
4. cohort/startup and cohort/partner relations
5. `cms/events.json` and event/startup relations
6. `cms/evidence-records.json`
7. `cms/impact-metrics.json`
8. media manifests are loaded and counted, with no upload side effect

The operation is idempotent:

- startups upsert by `slug`;
- partners resolve by exact `name` and are inserted or updated;
- cohorts upsert by `year,public_label`;
- cohort and event relationships are replaced from relation datasets;
- events resolve by exact `name,event_date` and are inserted or updated;
- evidence uses a stable source/page key;
- impact metrics update by claim label and period end.

The command requires `NEXT_PUBLIC_SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`. Evidence ownership defaults to the seeded admin
`asweid657@gmail.com`; set `ASIP_SEED_ADMIN_EMAIL` to select another existing
profile.

```powershell
npm run seed:asip-source
```

## Publication and privacy rules

- Startup descriptions, founder names, country, sector, cohort, and website are
  public-profile candidates, not automatic publication approval.
- Source emails and raw page text stay in `provenance/` and are never inserted.
- Evidence and metrics enter the CMS as `pending` and `internal_only`.
- FY2025 financial and portfolio figures require owner review before changing
  either status to public or verified.
- Media availability does not imply image, logo, or likeness permission.
  Confirm rights before copying a manifested source asset into a public path.
- Source wording has been preserved where useful; editorial cleanup should not
  silently change numeric claims or company outcomes.

## Review checklist

Before an intentional seed run:

1. Check `index.json` counts against the individual files.
2. Review company names, websites, cohort membership, and country codes.
3. Confirm whether Agrodata should publicly display one or both cohorts.
4. Review evidence permissions and FY2025 financial claims.
5. Approve specific media assets and document their public/storage mapping.
6. Verify the configured Supabase URL is the intended environment.
