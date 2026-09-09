"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, MenuIcon } from "lucide-react";
import { useState } from "react";

import type { SiteNavLabels } from "@/components/layout/site-nav-labels";
import { SiteAccountMenu } from "@/components/layout/site-account-menu";
import { buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
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
  /** Signed-in account email; shows desktop avatar menu when set. */
  email?: string | null;
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
  onLinkClick,
}: {
  locale: Locale;
  pathname: string;
  groupLabel: string;
  onLinkClick?: () => void;
}) {
  return (
    <div
      className="flex items-center border border-black/10 bg-white"
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
              "inline-flex min-h-10 min-w-11 items-center justify-center text-xs font-semibold uppercase transition-colors hover:bg-muted",
              active
                ? "bg-[#14333b] text-white hover:bg-[#14333b]"
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

export function SiteNavbar({ locale, labels, email = null }: SiteNavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const homeHref = publicPath(locale, "");
  const foundersHref = publicPath(locale, "founders");
  const alumniHref = publicPath(locale, "alumni");
  const directoryLabel = locale === "fr" ? "Annuaire" : "Directory";
  const mastheadLabel =
    locale === "fr"
      ? "Un programme du Groupe Telecel"
      : "A Telecel Group programme";
  const accountEmail = email?.trim() ? email.trim() : null;

  const desktopLinkClass = (active: boolean) =>
    cn(
      "relative flex min-h-12 items-center rounded-none bg-transparent px-4 text-sm font-semibold text-[#14333b] transition-colors hover:bg-transparent hover:text-[#179191] focus:bg-transparent",
      active && "text-[#179191] shadow-[inset_0_-3px_0_#179191]",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#fbfaf6]/97 text-[#14333b] backdrop-blur-md">
      <div className="grid h-1 grid-cols-4" aria-hidden>
        <span className="bg-[#179191]" />
        <span className="bg-[#81b764]" />
        <span className="bg-[#c14a9b]" />
        <span className="bg-[#dc395f]" />
      </div>

      <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 md:h-[4.75rem] lg:px-10">
        <Link
          href={homeHref}
          className="flex min-w-0 items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <Image
            src="/ASIP_LOGO.png"
            alt="Africa Startup Initiative Program"
            width={864}
            height={289}
            priority
            sizes="190px"
            className="h-11 w-auto md:h-12"
          />
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <p className="hidden border-l border-black/12 pl-4 text-xs font-semibold uppercase text-muted-foreground lg:block">
            {mastheadLabel}
          </p>
          <LanguageToggle
            locale={locale}
            pathname={pathname}
            groupLabel={labels.languageGroupLabel}
          />
          <Link
            href={labels.apply.href}
            className={cn(
              buttonVariants({ size: "sm" }),
              "min-h-10 gap-2 px-4",
            )}
          >
            {labels.apply.label}
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
          {accountEmail ? (
            <SiteAccountMenu email={accountEmail} locale={locale} />
          ) : null}
        </div>

        <div className="flex justify-end md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "min-h-11 min-w-11 border-[#14333b]/25 bg-transparent",
              )}
              aria-label={labels.menuLabel}
            >
              <MenuIcon className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-sm">
              <SheetHeader className="border-b">
                <SheetTitle>{labels.menuLabel}</SheetTitle>
              </SheetHeader>
              <nav
                className="flex flex-1 flex-col gap-1 overflow-y-auto p-5"
                aria-label="Primary"
              >
                {labels.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "h-12 justify-start text-base",
                      isNavActive(pathname, item.href, locale) &&
                        "bg-muted text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-3 border-t" />
                <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">
                  {labels.languageGroupLabel}
                </p>
                <LanguageToggle
                  locale={locale}
                  pathname={pathname}
                  groupLabel={labels.languageGroupLabel}
                  onLinkClick={() => setOpen(false)}
                />
                <div className="my-3 border-t" />
                <Link
                  href={labels.apply.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full gap-2",
                  )}
                >
                  {labels.apply.label}
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="hidden border-t border-black/8 bg-white/45 md:block">
        <div className="mx-auto flex min-h-12 w-full max-w-7xl items-center px-8 lg:px-10">
          <NavigationMenu className="max-w-none flex-1 justify-start" align="start">
            <NavigationMenuList className="justify-start gap-1">
              {labels.items
                .filter((item) => item.href !== alumniHref)
                .map((item) => {
                  const active =
                    isNavActive(pathname, item.href, locale) ||
                    (item.href === foundersHref &&
                      pathname.startsWith(alumniHref));

                  if (item.href === foundersHref) {
                    return (
                      <NavigationMenuItem key={item.href}>
                        <NavigationMenuTrigger className={desktopLinkClass(active)}>
                          {item.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-64 gap-1 p-2">
                            <li>
                              <NavigationMenuLink
                                render={<Link href={foundersHref} />}
                                closeOnClick
                                className="min-h-12 rounded-sm px-4 py-3 font-semibold"
                              >
                                {directoryLabel}
                              </NavigationMenuLink>
                            </li>
                            <li>
                              <NavigationMenuLink
                                render={<Link href={alumniHref} />}
                                closeOnClick
                                className="min-h-12 rounded-sm px-4 py-3 font-semibold"
                              >
                                Alumni
                              </NavigationMenuLink>
                            </li>
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
                        className={desktopLinkClass(active)}
                      >
                        {item.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
}
