# CDN readiness report — v2

**Date:** 27 August 2026 (v1: 26 August 2026)  
**Scope:** Next.js app + Supabase Storage (generic CDN / edge readiness)  
**Status:** CDN-ready for current product surface — remaining items are feature-dependent only

**Done this cycle:** Storage `cacheControl`, upload WebP pipeline, startups storage + data cache, pinned `remotePatterns`, Option A marketing HTML, scoped middleware, `headers()` HTTP split (marketing `s-maxage`, private auth/dashboard, long-cache static/OG), author avatars via `next/image`, unused `public/` SVGs removed, architecture doc HTTP split.

---

## Verdict

App-level CDN/media foundations for **blogs + startup logos + marketing HTML** are in place. Custom CDN / purge is **not** required for the current public-media model.

Still deferred until features exist: gallery, private docs, optional custom CDN domain.

---

## Checklist scan

### 1. Correct cache headers — **Done**

| Layer | Status |
|--------|--------|
| Next `_next/static/*` | ✅ Handled by Next/host (hashed → long-cache) |
| Supabase uploads | ✅ `cacheControl: "31536000"` on blogs + startups (+ seed) |
| `next.config.ts` `headers()` | ✅ Marketing HTML, auth/dashboard private, static/OG long-cache |

---

### 2. Cache-control strategy — **Done**

- ✅ Blog + startup `unstable_cache` / tags / `revalidatePath`
- ✅ Documented HTTP split in `Docs/[06] Documentation/[6.6] CDN and storage architecture.md`
- ✅ Option A chrome + locale cookie only when changed
- ✅ Marketing `s-maxage=300, stale-while-revalidate=86400`
- ✅ Auth/dashboard `private, no-store`

---

### 3. Asset versioning — **Done**

- ✅ Next hashed `/_next/static/…`
- ✅ Blog + startup uploads: nanoid paths + `.webp`
- ✅ Unused unhashed `public/` SVGs removed; `headers()` covers any future root static files

---

### 4. Immutable static assets — **Done**

- ✅ Middleware skips `_next/static` and `_next/image`
- ✅ Next hashed assets + long-cache headers for root static/OG

---

### 5. Public / private file handling — **Done for current media**

- ✅ Public buckets `blogs`, `auther`, `startups` + admin write RLS
- ⚪ Private buckets / gallery — when those features ship

---

### 6. Cache invalidation strategy — **Done for current model**

- ✅ Tag + path revalidation; versioned Storage paths; short HTML `s-maxage`
- ⚪ CDN purge — only with a custom CDN later

---

### 7. Image optimization — **Done for current UI**

- ✅ `next/image` on covers, startups, logo cloud, **author avatars** (`AuthorAvatar`)
- ✅ Upload pipeline resize + WebP
- ✅ Plain `<img>` for editor blob previews only
- ⚪ AVIF / multi-variant — future

---

### 8. CDN URLs — **Done for current architecture**

- ✅ Supabase public Storage CDN + same-origin Next assets (documented)
- ⚪ Custom `cdn.…` — only with demonstrated need

---

### 9. CORS for assets — **OK (N/A in app)**

- ✅ Fine for public Storage + same-site pages

---

### 10. Upload / storage architecture — **Done for blogs + logos**

- ✅ Admin actions, MIME/size, nanoid, `cacheControl`, process-image, DB + delete old
- ⚪ Gallery / private / direct uploads — when needed

---

## Scorecard

| Checklist item | Status |
|----------------|--------|
| Correct cache headers | ✅ |
| Cache-control strategy | ✅ |
| Asset versioning | ✅ |
| Immutable static assets | ✅ |
| Public/private files | ✅ current media; ⚪ private/gallery later |
| Cache invalidation | ✅ |
| Image optimization | ✅ |
| CDN URLs | ✅ |
| CORS for assets | ✅ N/A |
| Upload/storage architecture | ✅ blogs + logos; ⚪ gallery later |

---

## What still needs fixing

### Only when the feature arrives

1. **Startup gallery** — reuse logo pattern (`cacheControl` + `process-image`).
2. **Private docs** — private bucket + signed URLs.
3. **Custom CDN / purge** — only with a real production need.

### Explicitly not required now

- AVIF multi-variant pipeline  
- Direct-to-Storage multipart uploads  
- Renaming the `auther` bucket (ops-only)

---

## Related

- Architecture: `Docs/[06] Documentation/[6.6] CDN and storage architecture.md`
- Rules: `.cursor/rules/cdn-media.mdc`
- Upload pipeline: `lib/media/process-image.ts`
- Author avatars: `components/marketing/author-avatar.tsx`
- HTTP headers: `next.config.ts`
