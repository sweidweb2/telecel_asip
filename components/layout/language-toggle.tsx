"use client";

import Link from "next/link";

import { LOCALES, type Locale } from "@/constants/locales";
import { swapLocaleInPath } from "@/lib/i18n/path";
import { cn } from "@/lib/utils";

type LanguageToggleProps = {
  locale: Locale;
  pathname: string;
  groupLabel: string;
  onLinkClick?: () => void;
  className?: string;
};

export function LanguageToggle({
  locale,
  pathname,
  groupLabel,
  onLinkClick,
  className,
}: LanguageToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex w-fit shrink-0 self-start items-center gap-0.5 overflow-hidden rounded-full border border-black/10 bg-white p-0.5 shadow-sm",
        className,
      )}
      role="group"
      aria-label={groupLabel}
    >
      {LOCALES.map((loc) => {
        const active = loc === locale;
        return (
          <Link
            key={loc}
            href={swapLocaleInPath(pathname || `/${locale}`, loc)}
            hrefLang={loc}
            onClick={onLinkClick}
            className={cn(
              "inline-flex min-h-9 min-w-10 flex-1 items-center justify-center rounded-full px-3 text-center text-xs font-semibold uppercase transition-colors hover:bg-muted",
              active
                ? "bg-brand text-white hover:bg-brand hover:text-white"
                : "text-muted-foreground",
            )}
            aria-current={active ? "true" : undefined}
          >
            {loc}
          </Link>
        );
      })}
    </div>
  );
}
