"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { SiteNavLabels } from "@/components/layout/site-nav-labels";
import { Button } from "@/components/ui/button";
import { LOCALES, type Locale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { swapLocaleInPath } from "@/lib/i18n/path";
import { cn } from "@/lib/utils";

type SiteNavbarProps = {
  locale: Locale;
  labels: SiteNavLabels;
};

const AUTH_LABELS: Record<
  Locale,
  { dashboard: string; login: string; register: string }
> = {
  en: {
    dashboard: "Dashboard",
    login: "Login",
    register: "Register",
  },
  fr: {
    dashboard: "Tableau de bord",
    login: "Connexion",
    register: "Inscription",
  },
};

export function SiteNavbar({ locale, labels }: SiteNavbarProps) {
  const pathname = usePathname();
  const auth = AUTH_LABELS[locale];
  const dashboardHref = labels.dashboard?.href ?? ROUTES.dashboard;
  const loginHref = labels.login?.href ?? ROUTES.login;
  const registerHref = labels.register?.href ?? ROUTES.register;
  const dashboardLabel = labels.dashboard?.label ?? auth.dashboard;
  const loginLabel = labels.login?.label ?? auth.login;
  const registerLabel = labels.register?.label ?? auth.register;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href={labels.items[0]?.href ?? `/${locale}`}
          className="font-heading shrink-0 text-sm font-semibold tracking-tight"
        >
          {labels.brand}
        </Link>
        <nav
          className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto"
          aria-label="Primary"
        >
          {labels.items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== `/${locale}` &&
                pathname.startsWith(`${item.href}/`));
            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                asChild
                className={cn(active && "bg-muted font-semibold")}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            );
          })}
          <div
            className="ml-2 flex items-center gap-1 border-l pl-2"
            role="group"
            aria-label={labels.languageGroupLabel}
          >
            {LOCALES.map((loc) => {
              const href = swapLocaleInPath(pathname || `/${locale}`, loc);
              const isActive = loc === locale;
              return (
                <Link
                  key={loc}
                  href={href}
                  hrefLang={loc}
                  className={cn(
                    "px-1.5 text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground",
                    isActive &&
                      "font-bold text-foreground underline underline-offset-4"
                  )}
                  aria-current={isActive ? "true" : undefined}
                >
                  {loc}
                </Link>
              );
            })}
          </div>
          <div className="ml-1 flex shrink-0 items-center gap-1 border-l pl-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(pathname.startsWith(dashboardHref) && "bg-muted")}
            >
              <Link href={dashboardHref}>{dashboardLabel}</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(pathname === loginHref && "bg-muted")}
            >
              <Link href={loginHref}>{loginLabel}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={registerHref}>{registerLabel}</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
