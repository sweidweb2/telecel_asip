import type { NextConfig } from "next";

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

/** Shared edge cache for auth-agnostic marketing HTML (Option A). */
const MARKETING_HTML_CACHE =
  "public, s-maxage=300, stale-while-revalidate=86400";

/** Long-cache for unhashed public static files (rare; prefer hashed /_next/static). */
const PUBLIC_STATIC_CACHE = "public, max-age=31536000, immutable";

/** Dashboard / auth HTML — never shared-cache. */
const PRIVATE_NO_STORE = "private, no-store";

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
  images: {
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/:all*(svg|ico|png|jpg|jpeg|gif|webp)",
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
        source: "/:locale(en|fr)",
        headers: [
          { key: "Cache-Control", value: MARKETING_HTML_CACHE },
        ],
      },
      {
        source:
          "/:locale(en|fr)/:slug(about|programme|founders|impact|partners|insights|register-interest|alumni|apply|contact|faq|terms|privacy)",
        headers: [
          { key: "Cache-Control", value: MARKETING_HTML_CACHE },
        ],
      },
      {
        source: "/:locale(en|fr)/insights/:slug*",
        headers: [
          { key: "Cache-Control", value: MARKETING_HTML_CACHE },
        ],
      },
      {
        source: "/:locale(en|fr)/founders/:slug*",
        headers: [
          { key: "Cache-Control", value: MARKETING_HTML_CACHE },
        ],
      },
      {
        source: "/dashboard/:path*",
        headers: [
          { key: "Cache-Control", value: PRIVATE_NO_STORE },
        ],
      },
      {
        source: "/:locale(en|fr)/:auth(login|signup|register)",
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

export default nextConfig;
