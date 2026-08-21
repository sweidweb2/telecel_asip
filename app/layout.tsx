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
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ASIP — Africa Startup Initiative Program",
    template: "%s",
  },
  description:
    "Telecel Group’s Africa Startup Initiative Program supporting African technology ventures.",
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
