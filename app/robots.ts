import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/api/",
        "/admin/",
        "/login",
        "/signup",
        "/register",
        "/en/login",
        "/en/signup",
        "/fr/login",
        "/fr/signup",
        "/error/403",
        "/error/404",
        "/error/500",
        "/error/503",
        "/error",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
