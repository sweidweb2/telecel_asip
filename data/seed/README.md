# ASIP source-backed seed data

This directory contains normalized records extracted from `Docs/[05] Guy Data`.

- `asip-programme.json`: 42 unique accelerator alumni companies, 43 cohort
  memberships across Cohorts 1-4, programme milestones, and evidence-backed
  impact metrics.
- `asip-assets.json`: SHA-256 inventory of every source PDF, standalone image,
  logo, cohort slide, and video. Duplicate PDFs remain visible in the inventory
  so files can be audited without accidentally double-seeding their contents.

Run `npm run seed:asip-source` after the Supabase schema and local admin seed are
available. The script is idempotent and writes public-safe company fields,
cohorts, cohort/startup junctions, evidence records, and impact metrics.

## Data handling

The source booklets contain founder contact email addresses. They are retained
under each startup's `source_records` for internal provenance, but the seed
script deliberately does not insert them into public CMS tables. Impact claims
are inserted as `pending` with `internal_only` evidence until a programme owner
reviews publication permissions.

The asset manifest does not duplicate large binaries into `public/`. Existing
partner logos already have optimized public copies under `public/partners`, and
selected programme photography is under `public/asip-media`. Use the manifest
as the source-of-truth when selecting or uploading additional assets; its hashes
make duplicate detection deterministic.
