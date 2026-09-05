"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AdminFilterBarProps = {
  searchId: string;
  searchLabel: string;
  searchPlaceholder: string;
  search: string;
  isPending: boolean;
  onSearchChange: (value: string) => void;
  /** Extra filter controls (selects) rendered beside Clear. */
  children?: ReactNode;
  hasFilters: boolean;
  clearHref: string;
  onClear: () => void;
  searchMaxLength?: number;
};

/**
 * Shared CMS list filter chrome: search input, pending spinner, filter slot, Clear.
 */
export function AdminFilterBar({
  searchId,
  searchLabel,
  searchPlaceholder,
  search,
  isPending,
  onSearchChange,
  children,
  hasFilters,
  clearHref,
  onClear,
  searchMaxLength = 100,
}: AdminFilterBarProps) {
  return (
    <div className="flex flex-col gap-2 border-b p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Label htmlFor={searchId} className="sr-only">
          {searchLabel}
        </Label>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={searchId}
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          maxLength={searchMaxLength}
          autoComplete="off"
          className="min-h-11 pl-8 sm:min-h-8"
        />
        {isPending ? (
          <Loader2Icon className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {children}

        {hasFilters || search ? (
          <Link
            href={clearHref}
            aria-disabled={isPending}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "min-h-11 shrink-0 sm:min-h-8",
              isPending && "pointer-events-none opacity-50",
            )}
            onClick={onClear}
          >
            <XIcon />
            Clear
          </Link>
        ) : null}
      </div>
    </div>
  );
}
