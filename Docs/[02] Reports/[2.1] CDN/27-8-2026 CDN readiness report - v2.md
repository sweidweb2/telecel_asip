# CDN readiness report — v2

**Date:** 27 August 2026 (v1: 26 August 2026)  
**Scope:** Next.js app + Supabase Storage (generic CDN / edge readiness)  
**Status:** Partially CDN-ready — not CDN-hardened yet  
**Delta since v1:** Portfolio / startups logo storage shipped; startup uploads set long `cacheControl`; startups data cache mirrors blogs; Supabase `remotePatterns` pinned to project hostname. Core HTTP/HTML CDN gaps unchanged.

**Follow-up (same day):** Blog `cacheControl` aligned with startups; admin uploads run through `lib/media/process-image` (resize + WebP). **Option A marketing HTML:** nav always Apply; footer Login button; no `isAuthenticated()` in marketing chrome; middleware session refresh scoped to dashboard + auth. Host-level HTML CDN still a deploy step. No custom CDN / purge. Gallery / private docs / AVIF still deferred.

---

## Verdict

You’re partly CDN-ready for a **Next.js + Supabase Storage** setup, but not “CDN-hardened” yet. Remaining gaps are mostly **headers strategy** and **host-level HTML CDN config**, not missing `next/image`, Storage object metadata, or auth-personalized marketing chrome.

**What moved since v1:** startups logos follow the blogs pattern (public bucket, nanoid paths, admin write) with `cacheControl: "31536000"`. Blogs now match that TTL, and both features process uploads to WebP via `lib/media/process-image` before Storage. Marketing chrome is auth-agnostic (Option A).

---

## Checklist scan

### 1. Correct cache headers — **Gap (app-level)**

| Layer | Status |
|--------|--------|
| Next `_next/static/*` | Handled by Next/host (hashed → long-cache) |
| Your `next.config.ts` | **No** `headers()` / `Cache-Control` (images + redirects only) |
| Supabase uploads | **Handled** — blogs + startups set `cacheControl: "31536000"` |

You still never set HTTP cache headers in app code. You’re relying on platform defaults only for HTML / `public/`.

**Gap:** Explicit policy for HTML, `public/`, and OG images (Storage objects use long max-age).

---

### 2. Cache-control strategy — **Partial (data only)**

**Handled**
- Blog reads: `unstable_cache` + `revalidate: 300` + `BLOGS_CACHE_TAG` in `data/blogs.ts`
- Blog mutations: `revalidateTag` / `revalidatePath` in `actions/blogs.ts`
- **New (v2):** Startup reads: `unstable_cache` + `revalidate: 300` + `STARTUPS_CACHE_TAG` in `data/startups.ts` (list/page/slug/related/founded-years)
- **New (v2):** Startup mutations: `refreshStartupPaths()` → `revalidateTag` + portfolio path revalidation in `actions/startups.ts`

**Gaps**
- No documented split like: HTML `s-maxage` / `stale-while-revalidate` vs assets `immutable` vs APIs `private, no-store`
- Host-level full-page HTML CDN still not configured (app chrome is auth-agnostic; enabling edge HTML cache is a deploy step)
- Marketing layouts load `getActiveStartupFoundedYears()` for nav filters — tagged-cached shared data, not per-user

**Handled (Option A)**
- Marketing / auth / not-found chrome no longer calls `isAuthenticated()`; navbar always Apply; footer Login button
- Middleware refreshes Supabase session only on dashboard + auth routes; marketing is locale-only

---

### 3. Asset versioning — **Handled for Next + media uploads; Partial for `public/`**

**Handled**
- Next build hashes JS/CSS under `/_next/static/…`
- Blog uploads: `` `${blogId}/${nanoid(10)}.webp` `` (processed) then delete old file
- **New (v2):** Startup logo uploads: `` `${startupId}/${nanoid(10)}.webp` `` then delete old file — same content-busting model

**Gaps**
- Files in `public/` (few SVGs today) are **not** content-hashed
- Partner logos point at **external** `cdn.21st.dev` URLs (third-party versioning, not yours)

---

### 4. Immutable static assets — **Handled by framework default**

Middleware correctly skips `_next/static` and `_next/image`:

```text
"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
```

You don’t override that with bad headers. **No custom “immutable” policy** in repo, but Next’s hashed assets are the right model.

---

### 5. Public / private file handling — **Mostly handled (blogs + startups logos)**

**Handled**
- Public buckets `blogs` + `auther` with public SELECT + admin-only write (`supabase/migrations/20260826140100_blogs_storage_buckets.sql`)
- **New (v2):** Public bucket `startups` (5MB, jpeg/png/webp/gif, public read, admin write) — `supabase/migrations/20260826180100_startups_storage_bucket.sql`
- MIME + size limits on buckets
- App builds **public** URLs only (`/storage/v1/object/public/...`)
- Admin-gated uploads in `actions/blogs.ts` and `actions/startups.ts`

**Gaps**
- No **private** buckets / signed URLs yet (fine if everything media-related stays public)
- Startup **gallery** storage still not implemented (logo only)
- Bucket name typo `auther` (cosmetic/ops, not CDN)

---

### 6. Cache invalidation strategy — **Partial**

**Handled (app/data cache)**
- Tag + path revalidation on blog CRUD/image change
- **New (v2):** Same pattern for startup CRUD / logo change (`STARTUPS_CACHE_TAG` + `/en|fr/portfolio…`)

**Gaps (CDN / Storage)**
- No purge API / CDN webhook story
- Storage: replace-by-new-path helps browsers; **edge CDN can still cache old URL** until TTL if something still links it
- HTML/edge invalidation not designed (and hard while pages are auth-aware)

---

### 7. Image optimization — **Partial (improved for startups)**

**Handled**
- `next/image` on blog cards, featured section, startup cards, startup detail, admin startup cards/editor remote logos, logo cloud
- Responsive `sizes` on several marketing images; startup detail uses `priority`
- **New (v2):** `remotePatterns` for Untitled UI, `cdn.21st.dev`, and **pinned** Supabase hostname from `NEXT_PUBLIC_SUPABASE_URL` + pathname `/storage/v1/object/public/**` (no more wildcard `*.supabase.co` uncertainty)

**Gaps**
- Avatars use `AvatarImage` (plain `<img>`), **not** `next/image` — no optimizer/CDN transform (blog cards, featured, insight detail)
- No blur placeholders / consistent `priority` policy beyond featured / startup detail heroes
- Local blob previews in editors correctly use plain `<img>` (not a CDN gap)
- **Handled now:** app-side resize + WebP via `lib/media/process-image` before Storage (covers, avatars, startup logos). AVIF / multi-variant sizes still future.

---

### 8. CDN URLs if needed — **Partial / not productionized**

**Today**
- Media: `NEXT_PUBLIC_SUPABASE_URL` + `/storage/v1/object/public/...` (Supabase’s CDN front) — blogs + startups
- Logos: third-party `cdn.21st.dev`
- App assets: same origin as the Next host (Vercel Edge if you deploy there)

**Gaps**
- No custom asset domain (e.g. `cdn.asip…` / Cloudflare in front of Storage)
- No env like `NEXT_PUBLIC_CDN_URL` / image loader rewrite
- No decision doc: host CDN vs Supabase CDN vs dual

---

### 9. CORS for assets — **Not in this repo (platform config)**

No CORS headers or asset CORS docs in the Next app. For **public Storage + same-site pages** this is usually fine. Gaps appear if you:
- Load Storage from a **custom CDN domain**
- Use canvas / cross-origin fetches
- Serve fonts/assets cross-origin

That lives in **Supabase Storage / CDN dashboard**, not in your TS today.

---

### 10. Upload / storage architecture — **Solid for blogs + startup logos; gallery still open**

**Handled (blogs)**
- Server Action upload (admin only)
- Path namespacing by `blogId`
- MIME/size checks
- **`cacheControl: "31536000"`** on upload
- Resize + WebP via `lib/media/process-image` (`blogCover` / `blogAvatar`)
- DB URL update + delete previous object
- Rollback delete on failed DB update

**Handled (startups — new since v1)**
- Same admin Server Action pattern (`uploadStartupLogo` / `removeStartupLogo`)
- Path namespacing by `startupId` + nanoid
- MIME/size checks (5MB)
- **`cacheControl: "31536000"`** on upload
- Resize + WebP via `lib/media/process-image` (`startupLogo`)
- DB `logo_url` update + delete previous object

**Gaps**
- No AVIF / multi-variant stored sizes yet (single WebP per upload)
- No multipart / direct-to-Storage signed upload (all bytes through Next server)
- No private/sensitive uploads
- Startup **gallery** still a doc/task TODO, not code — when shipped, reuse startups logo pattern (including `cacheControl` + process-image)

---

## Scorecard

| Checklist item | Status | vs v1 |
|----------------|--------|-------|
| Correct cache headers | Gap (app HTTP); Storage OK (`cacheControl` on blogs + startups) | Improved |
| Cache-control strategy | Partial (Next data cache for blogs **and** startups) | Improved |
| Asset versioning | Partial (Next + nanoid `.webp` paths; not `public/` / CDN URL layer) | Improved |
| Immutable static assets | OK via Next defaults | Same |
| Public/private files | OK for blog + startups public buckets; no private pattern; no gallery | Improved |
| Cache invalidation | Partial (revalidatePath/Tag for blogs + startups; no CDN/Storage purge policy) | Improved |
| Image optimization | Partial (`next/image` + upload resize/WebP; display avatars still plain `<img>`) | Improved |
| CDN URLs | Partial (Supabase public URLs; no first-party CDN) | Same |
| CORS for assets | Not configured in app (usually OK for public Storage) | Same |
| Upload/storage architecture | Solid for blogs + startup logos (WebP pipeline); gallery incomplete | Improved |

---

## Highest-impact gaps before “CDN-efficient”

1. **Host-level HTML CDN** — app Option A is done; enabling shared edge `s-maxage` for marketing is a deploy/config decision (watch locale cookie / `Vary`).
2. **Add `headers()`** (or host rules) for `public/` and any non-hashed assets.
3. **Optimize display avatars** through `next/image` (or a loader) — upload side already WebP-processed.
4. **Document** invalidation: tag revalidate (pages) vs new object key (media) vs CDN purge (if you add one).
5. When gallery ships, **reuse** the startups logo pattern (public read, admin write, versioned paths, `cacheControl`, `process-image`).

---

## Related

- Prompt / checklist source: `Docs/[04] prompts/04-cdn-readiness-checklist.md` (also referenced historically as `[6.7] CDN ready.md`)
- Project checklist CDN item: `Docs/[06] Documentation/[6.1] Project Checklist - v2 .md`
- Startups storage migration: `supabase/migrations/20260826180100_startups_storage_bucket.sql`
- Startups upload + cache: `actions/startups.ts` (`LOGO_CACHE_CONTROL`)
- Startups data cache: `data/startups.ts` (`STARTUPS_CACHE_TAG`)
- Upload image pipeline: `lib/media/process-image.ts`
