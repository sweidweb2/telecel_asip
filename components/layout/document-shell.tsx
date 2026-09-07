import type { ReactNode } from "react";
import NextTopLoader from "nextjs-toploader";

import { ThemeProvider } from "@/components/layout/theme-provider";
import { BoneyardSetup } from "@/components/skeleton/boneyard-setup";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { geistMono, sora, sourceSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type DocumentShellProps = {
  lang: string;
  children: ReactNode;
};

/**
 * Shared `<html>` / `<body>` chrome for dual root layouts.
 * Keep request APIs (e.g. `headers()`) out of callers so marketing can stay static.
 */
export function DocumentShell({ lang, children }: DocumentShellProps) {
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
        "font-sans",
      )}
    >
      <body className="flex min-h-full flex-col">
        <BoneyardSetup />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="#179191" height={2} showSpinner={false} />
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
