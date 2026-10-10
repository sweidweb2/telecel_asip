"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDownIcon, MenuIcon } from "lucide-react";
import { useState } from "react";

import type { SiteNavLabels } from "@/components/layout/site-nav-labels";
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

export function SiteNavbar({ locale, labels }: SiteNavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const homeHref = publicPath(locale, "");
  const foundersHref = publicPath(locale, "founders");
  const alumniHref = publicPath(locale, "alumni");
  const alumniItem = labels.items.find((item) => item.href === alumniHref);

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
            <SheetContent
              side="right"
              className="!inset-y-2 !right-2 !h-auto w-3/4 max-w-[20rem] gap-0 overflow-hidden rounded-3xl border border-[#14333b]/12 bg-[#fbfaf6] p-0 shadow-2xl"
            >
              <SheetHeader className="shrink-0 border-b border-[#14333b]/10 px-6 py-5">
                <SheetTitle className="text-lg font-semibold text-[#14333b]">
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
                {labels.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "h-12 shrink-0 justify-start rounded-xl px-4 text-base text-[#14333b] hover:bg-[#179191]/8 hover:text-[#179191]",
                      isNavActive(pathname, item.href, locale) &&
                        "bg-[#179191]/10 font-semibold text-[#179191]",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-3 shrink-0 border-t border-[#14333b]/10" />
                <p className="mb-1 shrink-0 px-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {labels.languageGroupLabel}
                </p>
                <LanguageToggle
                  locale={locale}
                  pathname={pathname}
                  groupLabel={labels.languageGroupLabel}
                  onLinkClick={() => setOpen(false)}
                />
                <div className="my-3 shrink-0 border-t border-[#14333b]/10" />
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

      <div className="hidden border-t border-black/8 bg-white/45 md:block">
        <nav
          className="mx-auto flex min-h-12 w-full max-w-7xl items-center gap-1 px-8 lg:px-10"
          aria-label="Primary"
        >
          {labels.items
            .filter((item) => item.href !== alumniHref)
            .map((item) => {
              const active =
                isNavActive(pathname, item.href, locale) ||
                (item.href === foundersHref &&
                  pathname.startsWith(alumniHref));

              if (item.href === foundersHref) {
                return (
                  <DropdownMenu key={item.href} modal={false}>
                    <DropdownMenuTrigger
                      className={cn(
                        desktopLinkClass(active),
                        "cursor-pointer border-0 [&_svg]:transition-transform [&_svg]:duration-200 data-popup-open:[&_svg]:rotate-180",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {item.label}
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
                      <DropdownMenuItem
                        className="min-h-12 cursor-pointer rounded-sm px-4 py-3 text-sm font-semibold"
                        nativeButton={false}
                        render={<Link href={foundersHref} />}
                      >
                        {labels.foundersDirectory}
                      </DropdownMenuItem>
                      {alumniItem ? (
                        <DropdownMenuItem
                          className="min-h-12 cursor-pointer rounded-sm px-4 py-3 text-sm font-semibold"
                          nativeButton={false}
                          render={<Link href={alumniItem.href} />}
                        >
                          {alumniItem.label}
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={desktopLinkClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>
      </div>
    </header>
  );
}
