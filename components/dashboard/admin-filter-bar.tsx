"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
 * Announces pending/complete state to screen readers via a polite live region.
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
  const [statusMessage, setStatusMessage] = useState("");
  const wasPending = useRef(false);

  useEffect(() => {
    let cancelled = false;
    // Defer setState so the effect body itself does not update React state synchronously.
    const id = window.setTimeout(() => {
      if (cancelled) return;
      if (isPending) {
        wasPending.current = true;
        setStatusMessage("Updating results…");
        return;
      }
      if (wasPending.current) {
        wasPending.current = false;
        setStatusMessage("Results updated");
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [isPending]);

  return (
    <div className="flex flex-col gap-2 border-b p-4 lg:flex-row lg:items-center">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {statusMessage}
      </div>
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
          aria-busy={isPending}
          className="min-h-11 pl-8 sm:min-h-8"
        />
        {isPending ? (
          <Loader2Icon
            className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground motion-reduce:animate-none"
            aria-hidden
          />
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
