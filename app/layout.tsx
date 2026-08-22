import type { Metadata } from "next";
import { headers } from "next/headers";
import NextTopLoader from "nextjs-toploader";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_HEADER,
} from "@/constants/locales";
import { geistMono, geistSans } from "@/lib/fonts";
import { siteUrl } from "@/lib/seo/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "ASIP — Africa Startup Initiative Program",
    template: "%s",
  },
  description:
    "Telecel Group’s Africa Startup Initiative Program supporting African technology ventures.",
  applicationName: "ASIP",
  openGraph: {
    type: "website",
    siteName: "ASIP",
    title: "ASIP — Africa Startup Initiative Program",
    description:
      "Telecel Group’s Africa Startup Initiative Program supporting African technology ventures.",
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
    title: "ASIP — Africa Startup Initiative Program",
    description:
      "Telecel Group’s Africa Startup Initiative Program supporting African technology ventures.",
    images: ["/opengraph-image.png"],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const headerStore = await headers();
  const headerLocale = headerStore.get(LOCALE_HEADER);
  const lang =
    headerLocale && isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextTopLoader color="#171717" height={2} showSpinner={false} />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
