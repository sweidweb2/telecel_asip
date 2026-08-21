"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, LogOutIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getDashboardPageTitle } from "@/constants/dashboard-nav";
import { DEFAULT_LOCALE } from "@/constants/locales";
import { publicPath } from "@/constants/routes";

export function DashboardHeader() {
  const pathname = usePathname();
  const title = getDashboardPageTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      <h1 className="min-w-0 truncate text-sm font-medium">{title}</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto min-h-11 min-w-11 rounded-full"
            aria-label="Open account menu"
          >
            <Avatar>
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 min-w-48">
          <DropdownMenuItem asChild className="min-h-11 cursor-pointer sm:min-h-8">
            <Link href={publicPath(DEFAULT_LOCALE)}>
              <HomeIcon />
              Go home
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="min-h-11 sm:min-h-8"
          >
            <LogOutIcon />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
