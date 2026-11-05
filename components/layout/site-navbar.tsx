"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDownIcon, MenuIcon } from "lucide-react";
import { useState } from "react";

import {
  isNavGroup,
  type NavEntry,
  type SiteNavLabels,
} from "@/components/layout/site-nav-labels";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
};

function isNavActive(pathname: string, href: string, locale: Locale) {
  return (
    pathname === href ||
    (href !== `/${locale}` && pathname.startsWith(`${href}/`))
  );
}

function isEntryActive(pathname: string, entry: NavEntry, locale: Locale) {
  if (isNavGroup(entry)) {
    return (
      isNavActive(pathname, entry.href, locale) ||
      entry.children.some((child) => isNavActive(pathname, child.href, locale))
    );
  }
  return isNavActive(pathname, entry.href, locale);
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
      className="inline-flex w-fit shrink-0 self-start items-center gap-0.5 overflow-hidden rounded-full border border-black/10 bg-white p-0.5 shadow-sm"
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
              "inline-flex min-h-9 min-w-10 items-center justify-center rounded-full px-3 text-xs font-semibold uppercase transition-colors hover:bg-muted",
              active
                ? "bg-asip-ink text-white hover:bg-asip-ink"
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

export function SiteNavbar({ locale, labels }: SiteNavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const homeHref = publicPath(locale, "");

  const desktopLinkClass = (active: boolean) =>
    cn(
      "relative flex min-h-11 items-center rounded-none bg-transparent px-2.5 text-sm font-semibold text-asip-ink transition-colors hover:bg-transparent hover:text-brand focus:bg-transparent xl:px-3",
      active && "text-brand shadow-[inset_0_-3px_0_var(--brand)]",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-background/97 text-asip-ink backdrop-blur-md">
      <div className="grid h-1 grid-cols-4" aria-hidden>
        <span className="bg-brand" />
        <span className="bg-brand-mid" />
        <span className="bg-asip-magenta" />
        <span className="bg-asip-coral" />
      </div>

      <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 md:h-[4.75rem] lg:gap-5 lg:px-8 xl:px-10">
        <Link
          href={homeHref}
          className="flex shrink-0 items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <Image
            src="/ASIP_LOGO_MARK.png"
            alt="Africa Startup Initiative, a Telecel Group Program"
            width={768}
            height={768}
            priority
            sizes="72px"
            className="h-14 w-auto sm:h-[3.75rem] md:h-16"
          />
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex xl:gap-1"
          aria-label="Primary"
        >
          {labels.items.map((entry) => {
            const active = isEntryActive(pathname, entry, locale);

            if (isNavGroup(entry)) {
              return (
                <DropdownMenu key={entry.href} modal={false}>
                  <DropdownMenuTrigger
                    className={cn(
                      desktopLinkClass(active),
                      "cursor-pointer border-0 [&_svg]:transition-transform [&_svg]:duration-200 data-popup-open:[&_svg]:rotate-180",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {entry.label}
                      <ChevronDownIcon
                        className="size-3.5 opacity-70"
                        aria-hidden
                      />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={4}
                    className="w-64 min-w-64 origin-top gap-1 rounded-md border p-2 shadow-md ring-0 duration-200 ease-out data-closed:slide-out-to-top-2 data-open:slide-in-from-top-2"
                  >
                    {entry.children.map((child) => (
                      <DropdownMenuItem
                        key={child.href}
                        className="min-h-12 cursor-pointer rounded-sm px-4 py-3 text-sm font-semibold"
                        nativeButton={false}
                        render={<Link href={child.href} />}
                      >
                        {child.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <Link
                key={entry.href}
                href={entry.href}
                className={desktopLinkClass(active)}
                aria-current={active ? "page" : undefined}
              >
                {entry.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex xl:gap-4">
          <p className="hidden border-l border-black/12 pl-4 text-xs font-semibold uppercase text-muted-foreground xl:block">
            {labels.masthead}
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
        </div>

        <div className="flex min-w-0 flex-1 justify-end lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "min-h-11 min-w-11 border-asip-ink/25 bg-transparent",
              )}
              aria-label={labels.menuLabel}
            >
              <MenuIcon className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="!inset-y-2 !right-2 !h-auto w-3/4 max-w-[20rem] gap-0 overflow-hidden rounded-3xl border border-asip-ink/12 bg-background p-0 shadow-2xl"
            >
              <SheetHeader className="shrink-0 border-b border-asip-ink/10 px-6 py-5">
                <SheetTitle className="text-lg font-semibold text-asip-ink">
                  {labels.menuLabel}
                </SheetTitle>
                <p className="pr-10 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {labels.masthead}
                </p>
              </SheetHeader>
              <nav
                className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-5"
                aria-label="Primary"
              >
                {labels.items.map((entry) => {
                  if (isNavGroup(entry)) {
                    return (
                      <div
                        key={entry.href}
                        className="flex flex-col gap-1.5"
                      >
                        <p className="shrink-0 px-4 pt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {entry.label}
                        </p>
                        {entry.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              buttonVariants({ variant: "ghost" }),
                              "h-12 shrink-0 justify-start rounded-xl px-4 text-base text-asip-ink hover:bg-brand/8 hover:text-brand",
                              isNavActive(pathname, child.href, locale) &&
                                "bg-brand/10 font-semibold text-brand",
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "h-12 shrink-0 justify-start rounded-xl px-4 text-base text-asip-ink hover:bg-brand/8 hover:text-brand",
                        isNavActive(pathname, entry.href, locale) &&
                          "bg-brand/10 font-semibold text-brand",
                      )}
                    >
                      {entry.label}
                    </Link>
                  );
                })}
                <div className="my-3 shrink-0 border-t border-asip-ink/10" />
                <p className="mb-1 shrink-0 px-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {labels.languageGroupLabel}
                </p>
                <LanguageToggle
                  locale={locale}
                  pathname={pathname}
                  groupLabel={labels.languageGroupLabel}
                  onLinkClick={() => setOpen(false)}
                />
                <div className="my-3 shrink-0 border-t border-asip-ink/10" />
                <Link
                  href={labels.apply.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full shrink-0 gap-2 rounded-full",
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
    </header>
  );
}
