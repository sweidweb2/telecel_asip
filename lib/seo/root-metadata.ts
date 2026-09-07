import type { Metadata } from "next";

import { siteUrl } from "@/lib/seo/site";

/** Shared default metadata for both dual root layouts. */
export const rootMetadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "ASIP | African Founders, Technology & Impact",
    template: "%s",
  },
  description:
    "ASIP by Telecel Group connects African technology founders to expertise, capital pathways, markets and partners to build and scale strong businesses.",
  applicationName: "ASIP",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "ASIP",
    title: "ASIP | African Founders, Technology & Impact",
    description:
      "ASIP by Telecel Group connects African technology founders to expertise, capital pathways, markets and partners to build and scale strong businesses.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "ASIP — Africa Startup Initiative Program",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ASIP | African Founders, Technology & Impact",
    description:
      "ASIP by Telecel Group connects African technology founders to expertise, capital pathways, markets and partners to build and scale strong businesses.",
    images: ["/opengraph-image.png"],
  },
};
