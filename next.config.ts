import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.untitledui.com",
      },
    ],
  },
};

export default nextConfig;
