"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore, useTransition } from "react";
import {
  HomeIcon,
  Loader2Icon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

import { signOut } from "@/actions/auth";
import { StaffPageSearch } from "@/components/dashboard/staff-page-search";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ADMIN_SEARCH_PAGES, getAdminPageTitle } from "@/constants/admin-nav";
import {
  DASHBOARD_COMMAND_PAGES,
  getDashboardPageTitle,
} from "@/constants/dashboard-nav";
import { DEFAULT_LOCALE } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { DashboardAccount } from "@/types/profile";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] as const;

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export function StaffHeader({
  account,
  panelLabel = "Editor panel",
  titleResolver = "editor",
}: {
  account: DashboardAccount;
  panelLabel?: string;
  titleResolver?: "editor" | "admin";
}) {
  const pathname = usePathname();
  const title =
    titleResolver === "admin"
      ? getAdminPageTitle(pathname)
      : getDashboardPageTitle(pathname);
  const searchCatalog =
    titleResolver === "admin" ? ADMIN_SEARCH_PAGES : DASHBOARD_COMMAND_PAGES;
  const [isPending, startTransition] = useTransition();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { theme, setTheme } = useTheme();
  const mounted = useIsClient();

  function handleSignOut() {
    setIsSigningOut(true);
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <header className="sticky top-0 z-30 grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_minmax(7rem,18rem)_minmax(0,1fr)] items-center gap-2 border-b border-border bg-card px-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,22rem)_minmax(0,1fr)] sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1 min-h-11 min-w-11 shrink-0 sm:min-h-8 sm:min-w-8" />
        <div className="hidden h-5 items-center sm:flex" aria-hidden>
          <Separator orientation="vertical" />
        </div>
        <h1 className="min-w-0 truncate font-heading text-base leading-5 font-semibold tracking-tight">
          {title}
        </h1>
      </div>

      <StaffPageSearch
        className="justify-self-center"
        catalog={searchCatalog}
        label={`Search ${panelLabel.toLowerCase()} pages`}
      />

      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "min-h-11 min-w-11 rounded-full",
            )}
            aria-label="Open account menu"
          >
            <Avatar>
              <AvatarFallback>{account.initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 min-w-56">
            <div className="grid px-2 py-1.5">
              <span className="truncate text-sm font-medium">{account.name}</span>
              {account.email ? (
                <span className="truncate text-xs text-muted-foreground">
                  {account.email}
                </span>
              ) : null}
              <span className="truncate text-xs text-muted-foreground">
                {panelLabel}
              </span>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="min-h-11 cursor-pointer sm:min-h-8"
              render={<Link href={publicPath(DEFAULT_LOCALE)} />}
              nativeButton={false}
            >
              <HomeIcon />
              Go home
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <DropdownMenuItem
                key={value}
                className="min-h-11 cursor-pointer sm:min-h-8"
                onClick={() => {
                  setTheme(value);
                }}
              >
                <Icon />
                {label}
                {mounted && theme === value ? (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Active
                  </span>
                ) : null}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="min-h-11 sm:min-h-8"
              disabled={isPending || isSigningOut}
              onClick={() => {
                handleSignOut();
              }}
            >
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog
        open={isSigningOut}
        onOpenChange={(open) => {
          if (!open && isSigningOut) return;
          setIsSigningOut(open);
        }}
      >
        <DialogContent
          className="max-w-xs sm:max-w-xs"
          showCloseButton={false}
        >
          <DialogHeader className="items-center text-center">
            <Loader2Icon
              className="mx-auto size-8 animate-spin text-muted-foreground motion-reduce:animate-none"
              aria-hidden
            />
            <DialogTitle className="pt-2 text-base">Signing out</DialogTitle>
            <DialogDescription>
              Ending your session. You will be redirected to login.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </header>
  );
}
