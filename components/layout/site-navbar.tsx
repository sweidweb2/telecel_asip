"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function SiteNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href={ROUTES.home}
          className="font-heading text-sm font-semibold tracking-tight"
        >
          Telecel
        </Link>
        <nav className="flex items-center gap-1">
          <Button
            variant="ghost"
            asChild
            className={cn(pathname === ROUTES.dashboard && "bg-muted")}
          >
            <Link href={ROUTES.dashboard}>Dashboard</Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className={cn(pathname === ROUTES.login && "bg-muted")}
          >
            <Link href={ROUTES.login}>Login</Link>
          </Button>
          <Button asChild>
            <Link href={ROUTES.register}>Register</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
