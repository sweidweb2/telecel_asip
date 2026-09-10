"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { SearchIcon } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

import { Input } from "@/components/ui/input";
import {
  DASHBOARD_PAGE_SEARCH_MAX_LENGTH,
  filterDashboardSearchPages,
  resolveDashboardSearchHref,
  sanitizeDashboardPageSearchQuery,
} from "@/lib/admin/dashboard-page-search";
import { cn } from "@/lib/utils";
import type { DashboardSearchPage } from "@/constants/dashboard-nav";

/**
 * Header typeahead: search staff pages by name and navigate via allowlisted hrefs.
 */
export function DashboardPageSearch({
  className,
  catalog,
  label = "Search pages",
}: {
  className?: string;
  catalog?: readonly DashboardSearchPage[];
  label?: string;
}) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState<DashboardSearchPage[]>([]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function updateQuery(nextRaw: string) {
    const next = sanitizeDashboardPageSearchQuery(nextRaw);
    setQuery(next);
    const nextResults = filterDashboardSearchPages(next, catalog);
    setResults(nextResults);
    setActiveIndex(0);
    setOpen(nextResults.length > 0);
  }

  function navigateTo(page: DashboardSearchPage) {
    const href = resolveDashboardSearchHref(page.href);
    if (!href) return;
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) {
      if (event.key === "Escape") {
        setQuery("");
        setResults([]);
        setOpen(false);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const page = results[activeIndex];
      if (page) navigateTo(page);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative w-full max-w-sm", className)}>
      <label className="sr-only" htmlFor={`${listId}-input`}>
        {label}
      </label>
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={`${listId}-input`}
          type="search"
          role="combobox"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          maxLength={DASHBOARD_PAGE_SEARCH_MAX_LENGTH}
          value={query}
          placeholder="Search pages…"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={
            open && results[activeIndex]
              ? `${listId}-option-${activeIndex}`
              : undefined
          }
          className="h-9 min-h-9 bg-background pl-8 md:h-8 md:min-h-8"
          onChange={(event) => {
            updateQuery(event.target.value);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      {open && results.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Pages"
          className="absolute top-[calc(100%+0.35rem)] z-50 max-h-72 w-full overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {results.map((page, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={page.href} role="presentation">
                <button
                  type="button"
                  id={`${listId}-option-${index}`}
                  role="option"
                  aria-selected={isActive}
                  className={cn(
                    "flex w-full min-h-11 flex-col items-start gap-0.5 rounded-md px-2.5 py-2 text-left text-sm sm:min-h-9",
                    isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted/70",
                  )}
                  onMouseEnter={() => {
                    setActiveIndex(index);
                  }}
                  onClick={() => {
                    navigateTo(page);
                  }}
                >
                  <span className="font-medium">{page.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {page.group}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
