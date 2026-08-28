"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import type { SiteNavLabels } from "@/components/layout/site-nav-labels";
import { buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LOCALES, type Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { swapLocaleInPath } from "@/lib/i18n/path";
import { cn } from "@/lib/utils";

type SiteNavbarProps = {
  locale: Locale;
  labels: SiteNavLabels;
  /** Founded years from active startups for the Founders hover menu. */
  startupYears?: string[];
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
  onLinkClick,
}: {
  locale: Locale;
  pathname: string;
  groupLabel: string;
  className?: string;
  onLinkClick?: () => void;
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
            onClick={onLinkClick}
            className={cn(
              "inline-flex min-h-11 min-w-11 items-center justify-center px-1.5 text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground",
              isActive &&
                "font-bold text-foreground underline underline-offset-4",
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
  startupYears = [],
}: SiteNavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const applyHref = labels.apply.href;
  const applyLabel = labels.apply.label;
  const menuLabel = labels.menuLabel ?? (locale === "fr" ? "Menu" : "Menu");
  const foundersHref = publicPath(locale, "founders");
  const allYearsLabel = locale === "fr" ? "Toutes les années" : "All years";
  const yearsHeading = locale === "fr" ? "Par année" : "By year";

  const isCtaActive = isNavActive(pathname, applyHref, locale);

  const ctaLink = (
    <Link
      href={applyHref}
      onClick={() => setOpen(false)}
      aria-current={isCtaActive ? "page" : undefined}
      className={cn(
        buttonVariants({ size: "sm" }),
        "min-h-11 w-full justify-center lg:min-h-8 lg:w-auto",
        isCtaActive &&
          "bg-primary font-semibold text-primary-foreground ring-2 ring-primary/40 ring-offset-2 ring-offset-background hover:bg-primary/90",
      )}
    >
      {applyLabel}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto grid h-14 w-full max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href={labels.items[0]?.href ?? `/${locale}`}
          className="flex min-w-0 shrink-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Image
            src="/ASIP_LOGO.png"
            alt={labels.brand ?? "Africa Startup Initiative"}
            width={864}
            height={289}
            priority
            sizes="(max-width: 1024px) 168px, 192px"
            className="h-9 w-auto sm:h-10 dark:brightness-0 dark:invert"
          />
        </Link>

        <NavigationMenu
          className="hidden min-w-0 justify-center lg:flex"
          align="start"
        >
          <NavigationMenuList className="gap-1 xl:gap-2">
            {labels.items.map((item) => {
              const active = isNavActive(pathname, item.href, locale);
              const isFounders = item.href === foundersHref;

              if (isFounders && startupYears.length > 0) {
                return (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuTrigger
                      className={cn(
                        "min-h-8 bg-transparent",
                        active && "bg-muted font-semibold",
                      )}
                    >
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-44 gap-0.5 p-1">
                        <li>
                          <NavigationMenuLink
                            render={<Link href={foundersHref} />}
                            active={
                              pathname === foundersHref ||
                              pathname.startsWith(`${foundersHref}/`)
                            }
                            closeOnClick
                            className="min-h-9 px-2.5 py-2 font-medium"
                          >
                            {allYearsLabel}
                          </NavigationMenuLink>
                        </li>
                        {startupYears.map((year) => (
                          <li key={year}>
                            <NavigationMenuLink
                              render={
                                <Link
                                  href={`${foundersHref}?year=${encodeURIComponent(year)}`}
                                />
                              }
                              closeOnClick
                              className="min-h-9 px-2.5 py-2"
                            >
                              {year}
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                );
              }

              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    render={<Link href={item.href} />}
                    active={active}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "min-h-8 bg-transparent",
                      active && "bg-muted font-semibold",
                    )}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden items-center justify-end gap-2 lg:flex">
          <LanguageToggle
            locale={locale}
            pathname={pathname}
            groupLabel={labels.languageGroupLabel}
          />
          <div className="flex shrink-0 items-center border-l pl-2">
            {ctaLink}
          </div>
        </div>

        <div className="col-start-3 flex items-center justify-end lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "min-h-11 min-w-11",
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
                {labels.items.map((item) => {
                  const active = isNavActive(pathname, item.href, locale);
                  const isFounders = item.href === foundersHref;

                  if (isFounders && startupYears.length > 0) {
                    return (
                      <div key={item.href} className="flex flex-col gap-1">
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "h-11 justify-start",
                            active && "bg-muted font-semibold",
                          )}
                        >
                          {item.label}
                        </Link>
                        <p className="px-3 pt-1 text-xs font-medium text-muted-foreground">
                          {yearsHeading}
                        </p>
                        <div className="ml-2 flex flex-col gap-0.5 border-l pl-2">
                          {startupYears.map((year) => (
                            <Link
                              key={year}
                              href={`${foundersHref}?year=${encodeURIComponent(year)}`}
                              onClick={() => setOpen(false)}
                              className={cn(
                                buttonVariants({ variant: "ghost" }),
                                "h-10 justify-start text-sm",
                              )}
                            >
                              {year}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "h-11 justify-start",
                        active && "bg-muted font-semibold",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <div className="my-2 border-t" />
                <div className="flex flex-col gap-2 px-1 py-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {labels.languageGroupLabel}
                  </p>
                  <LanguageToggle
                    locale={locale}
                    pathname={pathname}
                    groupLabel={labels.languageGroupLabel}
                    onLinkClick={() => setOpen(false)}
                  />
                </div>
                <div className="my-2 border-t" />
                <div className="flex flex-col gap-1">{ctaLink}</div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
