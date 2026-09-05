"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef, useState, useTransition } from "react";

const SEARCH_DEBOUNCE_MS = 600;

type UseAdminListFiltersArgs = {
  basePath: string;
  search: string;
};

/**
 * Shared debounce + URL search-param navigation for admin list filter bars.
 */
export function useAdminListFilters({
  basePath,
  search: querySearch,
}: UseAdminListFiltersArgs) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(querySearch);
  const [prevQuerySearch, setPrevQuerySearch] = useState(querySearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (querySearch !== prevQuerySearch) {
    setPrevQuerySearch(querySearch);
    setSearch(querySearch);
  }

  function cancelPendingSearch() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = null;
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function navigate(changes: Record<string, string>) {
    cancelPendingSearch();

    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (!value || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    next.set("page", "1");

    startTransition(() => {
      router.push(`${basePath}?${next.toString()}`);
    });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    cancelPendingSearch();
    debounceRef.current = setTimeout(() => {
      const nextSearch = value.trim();
      if (nextSearch === querySearch) return;
      navigate({ search: nextSearch });
    }, SEARCH_DEBOUNCE_MS);
  }

  function clearSearchLocal() {
    cancelPendingSearch();
    setSearch("");
  }

  return {
    search,
    isPending,
    navigate,
    handleSearchChange,
    clearSearchLocal,
  };
}
