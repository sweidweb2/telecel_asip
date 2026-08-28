"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONTACT_ENQUIRY_ADMIN_LABELS,
  CONTACT_ENQUIRY_TYPES,
} from "@/constants/contact-enquiry";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { ContactMessageListQuery } from "@/validations/contact-message";

const SEARCH_DEBOUNCE_MS = 600;

type ContactMessagesFiltersProps = {
  query: ContactMessageListQuery;
  onPendingChange?: (pending: boolean) => void;
};

export function ContactMessagesFilters({
  query,
  onPendingChange,
}: ContactMessagesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(query.search);
  const [prevQuerySearch, setPrevQuerySearch] = useState(query.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFilters = query.search !== "" || query.enquiryType !== "all";

  if (query.search !== prevQuerySearch) {
    setPrevQuerySearch(query.search);
    setSearch(query.search);
  }

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function navigate(changes: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (!value || (key === "enquiryType" && value === "all")) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    next.set("page", "1");

    startTransition(() => {
      router.push(`${ROUTES.contactUs}?${next.toString()}`);
    });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const nextSearch = value.trim();
      if (nextSearch === query.search) return;
      navigate({ search: nextSearch });
    }, SEARCH_DEBOUNCE_MS);
  }

  return (
    <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Label htmlFor="contact-messages-search" className="sr-only">
          Search contact messages
        </Label>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="contact-messages-search"
          type="search"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Filter by name, email, or subject…"
          maxLength={100}
          autoComplete="off"
          className="min-h-11 pl-8 sm:min-h-8"
        />
        {isPending ? (
          <Loader2Icon className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="contact-messages-enquiry-type" className="sr-only">
          Enquiry route
        </Label>
        <Select
          value={query.enquiryType}
          onValueChange={(value) => {
            if (value) navigate({ enquiryType: value });
          }}
          disabled={isPending}
        >
          <SelectTrigger
            id="contact-messages-enquiry-type"
            className="min-h-11 w-full sm:min-h-8 sm:w-40"
          >
            <SelectValue placeholder="All routes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All routes</SelectItem>
            {CONTACT_ENQUIRY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {CONTACT_ENQUIRY_ADMIN_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters || search ? (
          <Link
            href={ROUTES.contactUs}
            aria-disabled={isPending}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "min-h-11 shrink-0 sm:min-h-8",
              isPending && "pointer-events-none opacity-50",
            )}
            onClick={() => {
              setSearch("");
            }}
          >
            <XIcon />
            Clear
          </Link>
        ) : null}
      </div>
    </div>
  );
}
