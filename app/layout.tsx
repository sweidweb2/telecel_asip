import type { Metadata } from "next";
import { headers } from "next/headers";
import NextTopLoader from "nextjs-toploader";

import { ThemeProvider } from "@/components/layout/theme-provider";
import { BoneyardSetup } from "@/components/skeleton/boneyard-setup";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_HEADER,
} from "@/constants/locales";
import { geistMono, sora, sourceSans } from "@/lib/fonts";
import { siteUrl } from "@/lib/seo/site";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "ASIP | African Founders, Technology & Impact",
    template: "%s",
  },
  description:
    "ASIP by Telecel Group connects African technology founders to expertise, capital pathways, markets and partners to build and scale strong businesses.",
  applicationName: "ASIP",
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const headerStore = await headers();
  const headerLocale = headerStore.get(LOCALE_HEADER);
  const lang =
    headerLocale && isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        sourceSans.variable,
        sora.variable,
        geistMono.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col">
        <BoneyardSetup />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="#171717" height={2} showSpinner={false} />
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
