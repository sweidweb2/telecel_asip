"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import type { SiteNavLabels } from "@/components/layout/site-nav-labels";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LOCALES, type Locale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { swapLocaleInPath } from "@/lib/i18n/path";
import { cn } from "@/lib/utils";

type SiteNavbarProps = {
  locale: Locale;
  labels: SiteNavLabels;
  /** When true, show Dashboard only; otherwise Login + Register. */
  isAuthenticated?: boolean;
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

function isNavActive(pathname: string, href: string, locale: Locale) {
  return (
    pathname === href ||
    (href !== `/${locale}` && pathname.startsWith(`${href}/`))
  );
}

function LanguageToggle({
  locale,
  pathname,
  groupLabel,
  className,
}: {
  locale: Locale;
  pathname: string;
  groupLabel: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="group"
      aria-label={groupLabel}
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
              "inline-flex min-h-11 min-w-11 items-center justify-center px-1.5 text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground",
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
  );
}

export function SiteNavbar({
  locale,
  labels,
  isAuthenticated = false,
}: SiteNavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const auth = AUTH_LABELS[locale];
  const dashboardHref = labels.dashboard?.href ?? ROUTES.dashboard;
  const loginHref = labels.login?.href ?? ROUTES.login;
  const registerHref = labels.register?.href ?? ROUTES.register;
  const dashboardLabel = labels.dashboard?.label ?? auth.dashboard;
  const loginLabel = labels.login?.label ?? auth.login;
  const registerLabel = labels.register?.label ?? auth.register;
  const menuLabel = labels.menuLabel ?? (locale === "fr" ? "Menu" : "Menu");

  const authLinks = isAuthenticated ? (
    <Link
      href={dashboardHref}
      onClick={() => setOpen(false)}
      className={cn(
        buttonVariants({ size: "sm" }),
        "min-h-11 justify-start lg:min-h-8",
        pathname.startsWith(dashboardHref) && "bg-muted"
      )}
    >
      {dashboardLabel}
    </Link>
  ) : (
    <>
      <Link
        href={loginHref}
        onClick={() => setOpen(false)}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "min-h-11 justify-start lg:min-h-8",
          pathname === loginHref && "bg-muted"
        )}
      >
        {loginLabel}
      </Link>
      <Link
        href={registerHref}
        onClick={() => setOpen(false)}
        className={cn(
          buttonVariants({ size: "sm" }),
          "min-h-11 lg:min-h-8"
        )}
      >
        {registerLabel}
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {labels.brand ? (
          <Link
            href={labels.items[0]?.href ?? `/${locale}`}
            className="font-heading shrink-0 text-sm font-semibold tracking-tight"
          >
            {labels.brand}
          </Link>
        ) : null}

        {/* Desktop navigation */}
        <nav
          className="hidden min-w-0 flex-1 items-center justify-end gap-1 lg:flex"
          aria-label="Primary"
        >
          {labels.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                isNavActive(pathname, item.href, locale) &&
                  "bg-muted font-semibold"
              )}
            >
              {item.label}
            </Link>
          ))}
          <LanguageToggle
            locale={locale}
            pathname={pathname}
            groupLabel={labels.languageGroupLabel}
            className="ml-2 border-l pl-2"
          />
          <div className="ml-1 flex shrink-0 items-center gap-1 border-l pl-2">
            {authLinks}
          </div>
        </nav>

        {/* Mobile / tablet: language + menu */}
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <LanguageToggle
            locale={locale}
            pathname={pathname}
            groupLabel={labels.languageGroupLabel}
          />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "min-h-11 min-w-11"
              )}
              aria-label={menuLabel}
            >
              <MenuIcon className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-sm">
              <SheetHeader className="border-b">
                <SheetTitle>{menuLabel}</SheetTitle>
              </SheetHeader>
              <nav
                className="flex flex-1 flex-col gap-1 overflow-y-auto p-4"
                aria-label="Primary"
              >
                {labels.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "h-11 justify-start",
                      isNavActive(pathname, item.href, locale) &&
                        "bg-muted font-semibold"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-2 border-t" />
                <div className="flex flex-col gap-1">{authLinks}</div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
