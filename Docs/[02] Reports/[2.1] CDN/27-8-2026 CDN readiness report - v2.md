# CDN readiness report — v2

**Date:** 27 August 2026 (v1: 26 August 2026)  
**Scope:** Next.js app + Supabase Storage (generic CDN / edge readiness)  
**Status:** Partially CDN-ready — not CDN-hardened yet  
**Delta since v1:** Portfolio / startups logo storage shipped; startup uploads set long `cacheControl`; startups data cache mirrors blogs; Supabase `remotePatterns` pinned to project hostname. Core HTTP/HTML CDN gaps unchanged.

---

## Verdict

You’re partly CDN-ready for a **Next.js + Supabase Storage** setup, but not “CDN-hardened” yet. Checklist item **CDN** in the project docs is still unchecked for a reason — most gaps are still **headers strategy**, **HTML cacheability**, and **inconsistent storage cache metadata**, not missing `next/image`.

**What moved since v1:** startups logos now follow the blogs pattern (public bucket, nanoid paths, admin write) and go further by setting `cacheControl: "31536000"`. Blogs still omit `cacheControl`, so Storage TTL policy is **inconsistent** across features.

---

## Checklist scan

### 1. Correct cache headers — **Gap (app-level)**

| Layer | Status |
|--------|--------|
| Next `_next/static/*` | Handled by Next/host (hashed → long-cache) |
| Your `next.config.ts` | **No** `headers()` / `Cache-Control` (images + redirects only) |
| Supabase uploads | **Partial** — startups logos set `cacheControl`; blogs do not |

You still never set HTTP cache headers in app code. You’re relying on platform defaults only for HTML / `public/`.

**Gap:** Explicit policy for HTML, `public/`, OG images, and **blog** Storage objects (startups logos are covered).

---

### 2. Cache-control strategy — **Partial (data only)**

**Handled**
- Blog reads: `unstable_cache` + `revalidate: 300` + `BLOGS_CACHE_TAG` in `data/blogs.ts`
- Blog mutations: `revalidateTag` / `revalidatePath` in `actions/blogs.ts`
- **New (v2):** Startup reads: `unstable_cache` + `revalidate: 300` + `STARTUPS_CACHE_TAG` in `data/startups.ts` (list/page/slug/related/founded-years)
- **New (v2):** Startup mutations: `refreshStartupPaths()` → `revalidateTag` + portfolio path revalidation in `actions/startups.ts`

**Gaps**
- No documented split like: HTML `s-maxage` / `stale-while-revalidate` vs assets `immutable` vs APIs `private, no-store`
- Marketing layouts still call `isAuthenticated()` (`app/(marketing)/en|fr/layout.tsx`), and **middleware always refreshes Supabase session** — HTML is effectively **personalized / cookie-tied**, so a full-page CDN edge cache is weak or wrong unless you redesign (e.g. shell + client auth snippet, or `Vary` / no HTML CDN)
- Marketing layouts now also load `getActiveStartupFoundedYears()` for nav filters — data is tagged-cached, but does **not** fix HTML personalization

---

### 3. Asset versioning — **Handled for Next + media uploads; Partial for `public/`**

**Handled**
- Next build hashes JS/CSS under `/_next/static/…`
- Blog uploads: `` `${blogId}/${nanoid(10)}.${ext}` `` then delete old file
- **New (v2):** Startup logo uploads: `` `${startupId}/${nanoid(10)}.${ext}` `` then delete old file — same content-busting model

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
- Blog upload still doesn’t set `cacheControl` on the object (startups do — 1 year)
- HTML/edge invalidation not designed (and hard while pages are auth-aware)

---

### 7. Image optimization — **Partial (improved for startups)**

**Handled**
- `next/image` on blog cards, featured section, startup cards, startup detail, admin startup cards/editor remote logos, logo cloud
- Responsive `sizes` on several marketing images; startup detail uses `priority`
- **New (v2):** `remotePatterns` for Untitled UI, `cdn.21st.dev`, and **pinned** Supabase hostname from `NEXT_PUBLIC_SUPABASE_URL` + pathname `/storage/v1/object/public/**` (no more wildcard `*.supabase.co` uncertainty)

**Gaps**
- Avatars use `AvatarImage` (plain `<img>`), **not** `next/image` — no optimizer/CDN transform (blog cards, featured, insight detail)
- No app-side resize/compress before upload (originals up to 5MB / 2MB)
- No blur placeholders / consistent `priority` policy beyond featured / startup detail heroes
- Local blob previews in editors correctly use plain `<img>` (not a CDN gap)

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
- DB URL update + delete previous object
- Rollback delete on failed DB update

**Handled (startups — new since v1)**
- Same admin Server Action pattern (`uploadStartupLogo` / `removeStartupLogo`)
- Path namespacing by `startupId` + nanoid
- MIME/size checks (5MB)
- **`cacheControl: "31536000"`** on upload
- DB `logo_url` update + delete previous object

**Gaps**
- Blog (and `scripts/seed-blogs.mjs`) uploads still omit `cacheControl` — align with startups
- No image pipeline (WebP/AVIF, max dimensions)
- No multipart / direct-to-Storage signed upload (all bytes through Next server)
- No private/sensitive uploads
- Startup **gallery** still a doc/task TODO, not code — when shipped, reuse startups logo pattern (including `cacheControl`)

---

## Scorecard

| Checklist item | Status | vs v1 |
|----------------|--------|-------|
| Correct cache headers | Gap (app HTTP); Storage partial via startups | Improved slightly |
| Cache-control strategy | Partial (Next data cache for blogs **and** startups) | Improved |
| Asset versioning | Partial (Next + nanoid paths for blogs **and** startups; not `public/` / CDN URL layer) | Improved |
| Immutable static assets | OK via Next defaults | Same |
| Public/private files | OK for blog + startups public buckets; no private pattern; no gallery | Improved |
| Cache invalidation | Partial (revalidatePath/Tag for blogs + startups; no CDN/Storage purge policy) | Improved |
| Image optimization | Partial (`next/image` yes for startups/blogs; avatars + upload pipeline no) | Improved |
| CDN URLs | Partial (Supabase public URLs; no first-party CDN) | Same |
| CORS for assets | Not configured in app (usually OK for public Storage) | Same |
| Upload/storage architecture | Solid for blogs + startup logos; gallery incomplete; blog `cacheControl` missing | Improved |

---

## Highest-impact gaps before “CDN-efficient”

1. **Decide HTML caching** — today middleware + auth in marketing layout still fight full-page CDN.
2. **Align Storage `cacheControl`** — blogs (and seed script) should match startups’ 1-year max-age for immutable nanoid paths.
3. **Add `headers()`** (or host rules) for `public/` and any non-hashed assets.
4. **Optimize avatars** through `next/image` (or a loader).
5. **Document** invalidation: tag revalidate (pages) vs new object key (media) vs CDN purge (if you add one).
6. When gallery ships, **reuse** the startups logo pattern (public read, admin write, versioned paths, `cacheControl`).

---

## Related

- Prompt / checklist source: `Docs/[04] prompts/04-cdn-readiness-checklist.md` (also referenced historically as `[6.7] CDN ready.md`)
- Project checklist CDN item: `Docs/[06] Documentation/[6.1] Project Checklist - v2 .md`
- Startups storage migration: `supabase/migrations/20260826180100_startups_storage_bucket.sql`
- Startups upload + cache: `actions/startups.ts` (`LOGO_CACHE_CONTROL`)
- Startups data cache: `data/startups.ts` (`STARTUPS_CACHE_TAG`)
