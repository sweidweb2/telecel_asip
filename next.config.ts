import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

import { legacyRedirectRules } from "./constants/legacy-redirects";
import { DEFAULT_LOCALE, LOCALES } from "./constants/locales";
import { PUBLIC_PAGE_SLUGS } from "./constants/public-pages";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/**
 * Keeps the cached-route matchers in step with the routes that actually exist,
 * so a newly added public page cannot silently ship without a cache header.
 */
const LOCALE_MATCHER = LOCALES.join("|");

/** Auth-agnostic marketing slugs only — intake reads the session and must not share HTML. */
const INTAKE_SLUGS = new Set(["apply", "register-interest"]);
const MARKETING_SLUG_MATCHER = PUBLIC_PAGE_SLUGS.filter(
  (slug) => Boolean(slug) && !INTAKE_SLUGS.has(slug),
).join("|");
const INTAKE_SLUG_MATCHER = [...INTAKE_SLUGS].join("|");

function supabaseStorageHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const supabaseHostname = supabaseStorageHostname();

/** Shared edge cache for auth-agnostic marketing HTML (Option A).
 *  60s aligns with site-settings tag cache so Apply/Register CTAs lag less. */
const MARKETING_HTML_CACHE =
  "public, s-maxage=60, stale-while-revalidate=86400";

/** Long-cache for unhashed public static files (rare; prefer hashed /_next/static). */
const PUBLIC_STATIC_CACHE = "public, max-age=31536000, immutable";

/** Dashboard / auth HTML — never shared-cache. */
const PRIVATE_NO_STORE = "private, no-store";

/** Crawler files — s-maxage matches the sitemap's 5m revalidate window. */
const CRAWLER_FILE_CACHE =
  "public, s-maxage=300, stale-while-revalidate=86400";

/**
 * Baseline security headers for every response.
 *
 * `frame-ancestors` is sent as a one-directive CSP rather than a full policy:
 * a script-src policy needs per-request nonces (Next inline bootstrap, Turnstile,
 * TipTap) and would have to be introduced with report-only first.
 */
const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /** Raw request body. Matches the 10 MB upload ceiling in `constants/upload.ts`. */
      bodySizeLimit: "10mb",
    },
    /**
     * Dual root layouts (`[locale]` + `(unlocalized)`) have no single root
     * `not-found` for unmatched URLs — without this, Next serves the default
     * black 404. `app/global-not-found.tsx` is the themed fallback.
     */
    globalNotFound: true,
  },
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.untitledui.com",
      },
      {
        protocol: "https",
        hostname: "cdn.21st.dev",
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
  /** 301s from the retired ASIP site (map in `constants/legacy-redirects.ts`). */
  async redirects() {
    return [
      ...legacyRedirectRules(DEFAULT_LOCALE),
      // Canonical public path is /programme (Text Pack v2). Keep /program as 301.
      {
        source: "/:locale(en|fr)/program/:path*",
        destination: "/:locale/programme/:path*",
        permanent: true,
      },
      {
        source: "/:locale(en|fr)/program",
        destination: "/:locale/programme",
        permanent: true,
      },
      // Status pages moved under /error so /[code] no longer clashes with /[locale].
      {
        source: "/:code(403|404|500|503)",
        destination: "/error/:code",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/:all*(svg|ico|png|jpg|jpeg|gif|webp|mp4|webm)",
        headers: [
          { key: "Cache-Control", value: PUBLIC_STATIC_CACHE },
        ],
      },
      {
        source: "/opengraph-image",
        headers: [
          { key: "Cache-Control", value: PUBLIC_STATIC_CACHE },
        ],
      },
      {
        source: `/:locale(${LOCALE_MATCHER})`,
        headers: [
          { key: "Cache-Control", value: MARKETING_HTML_CACHE },
        ],
      },
      {
        source: `/:locale(${LOCALE_MATCHER})/:slug(${MARKETING_SLUG_MATCHER})`,
        headers: [
          { key: "Cache-Control", value: MARKETING_HTML_CACHE },
        ],
      },
      {
        source: `/:locale(${LOCALE_MATCHER})/insights/:slug*`,
        headers: [
          { key: "Cache-Control", value: MARKETING_HTML_CACHE },
        ],
      },
      {
        source: `/:locale(${LOCALE_MATCHER})/founders/:slug*`,
        headers: [
          { key: "Cache-Control", value: MARKETING_HTML_CACHE },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Cache-Control", value: CRAWLER_FILE_CACHE },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          { key: "Cache-Control", value: CRAWLER_FILE_CACHE },
        ],
      },
      {
        source: "/dashboard/:path*",
        headers: [
          { key: "Cache-Control", value: PRIVATE_NO_STORE },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: PRIVATE_NO_STORE },
        ],
      },
      {
        source: `/:locale(${LOCALE_MATCHER})/:intake(${INTAKE_SLUG_MATCHER})`,
        headers: [
          { key: "Cache-Control", value: PRIVATE_NO_STORE },
        ],
      },
      {
        source: `/:locale(${LOCALE_MATCHER})/:auth(login|signup|register)`,
        headers: [
          { key: "Cache-Control", value: PRIVATE_NO_STORE },
        ],
      },
      {
        source: "/:auth(login|signup|register)",
        headers: [
          { key: "Cache-Control", value: PRIVATE_NO_STORE },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
