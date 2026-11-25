import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";

const COPY = {
  en: {
    open: "Applications are open.",
  },
  fr: {
    open: "Les candidatures sont ouvertes.",
  },
} as const;

type ApplicationStatusBannerProps = {
  locale: Locale;
  openApplications: boolean;
};

/**
 * Optional under-nav strip while applications are open.
 * Marketing / auth chrome no longer mounts this — Apply lives in the navbar
 * so a second Apply row does not appear under the header.
 */
export function ApplicationStatusBanner({
  locale,
  openApplications,
}: ApplicationStatusBannerProps) {
  if (!openApplications) return null;

  const cta = intakeCtaFor(locale, true);

  return (
    <div className="border-b bg-muted/40">
      <div className="mx-auto flex max-w-6xl flex-row items-center justify-between gap-3 px-4 py-2.5 sm:gap-4 sm:px-6">
        <p className="min-w-0 flex-1 text-pretty text-sm leading-snug text-muted-foreground">
          {COPY[locale].open}
        </p>
        <Button
          size="sm"
          className="min-h-11 shrink-0 px-4 sm:min-h-9"
          nativeButton={false}
          render={<Link href={cta.href} />}
        >
          {cta.label}
        </Button>
      </div>
    </div>
  );
}
