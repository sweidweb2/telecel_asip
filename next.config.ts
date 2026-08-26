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
  async redirects() {
    return [
      {
        source: "/en/impact",
        destination: "/en/programme#impact",
        permanent: true,
      },
      {
        source: "/fr/impact",
        destination: "/fr/programme#impact",
        permanent: true,
      },
      {
        source: "/impact",
        destination: "/en/programme#impact",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
