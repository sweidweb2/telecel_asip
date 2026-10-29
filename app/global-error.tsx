"use client";

import { RouteError } from "@/components/layout/route-error";
import { geistMono, sora, sourceSans } from "@/lib/fonts";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
}) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${sora.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <RouteError
          error={error}
          reset={reset}
          retry={retry}
          homeAsAnchor
        />
      </body>
    </html>
  );
}
