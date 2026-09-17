"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { SearchIcon } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

import { Input } from "@/components/ui/input";
import {
  STAFF_PAGE_SEARCH_MAX_LENGTH,
  filterStaffSearchPages,
  resolveStaffSearchHref,
  sanitizeStaffPageSearchQuery,
} from "@/lib/admin/staff-page-search";
import { cn } from "@/lib/utils";
import type { DashboardSearchPage } from "@/constants/dashboard-nav";

const emptySubscribe = () => () => {};

function useIsMacShortcut() {
  return useSyncExternalStore(
    emptySubscribe,
    () =>
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent),
    () => false,
  );
}

/**
 * Header typeahead: search staff pages by name and navigate via allowlisted hrefs.
 */
export function StaffPageSearch({
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
  const inputRef = useRef<HTMLInputElement>(null);
  const isMac = useIsMacShortcut();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState<DashboardSearchPage[]>([]);
  const shortcutLabel = isMac ? "⌘K" : "Ctrl+K";

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    function onGlobalKeyDown(event: globalThis.KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") {
        return;
      }

      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        const isTypingField =
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target.isContentEditable;
        if (isTypingField && target !== inputRef.current) {
          return;
        }
      }

      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    }

    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, []);

  function updateQuery(nextRaw: string) {
    const next = sanitizeStaffPageSearchQuery(nextRaw);
    setQuery(next);
    const nextResults = filterStaffSearchPages(next, catalog);
    setResults(nextResults);
    setActiveIndex(0);
    setOpen(nextResults.length > 0);
  }

  function navigateTo(page: DashboardSearchPage) {
    const href = resolveStaffSearchHref(page.href);
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
          ref={inputRef}
          id={`${listId}-input`}
          type="search"
          role="combobox"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          maxLength={STAFF_PAGE_SEARCH_MAX_LENGTH}
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
          className="h-11 min-h-11 bg-background pr-14 pl-8 md:h-9 md:min-h-9"
          onChange={(event) => {
            updateQuery(event.target.value);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        {query.trim() === "" ? (
          <kbd
            className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 items-center rounded border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground sm:inline-flex"
            aria-hidden
          >
            {shortcutLabel}
          </kbd>
        ) : null}
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
