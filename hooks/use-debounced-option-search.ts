"use client";

import { useEffect, useState } from "react";

const OPTION_SEARCH_DEBOUNCE_MS = 300;

/**
 * Local search string with a debounced value for reloading admin option pickers.
 * Resets when `enabled` becomes true; later edits wait {@link OPTION_SEARCH_DEBOUNCE_MS}.
 */
export function useDebouncedOptionSearch(enabled: boolean) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [prevEnabled, setPrevEnabled] = useState(enabled);

  if (enabled !== prevEnabled) {
    setPrevEnabled(enabled);
    if (enabled) {
      setSearch("");
      setDebouncedSearch("");
    }
  }

  useEffect(() => {
    if (!enabled) return;

    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim().slice(0, 100));
    }, OPTION_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [enabled, search]);

  return {
    search: enabled ? search : "",
    setSearch,
    debouncedSearch: enabled ? debouncedSearch : "",
  };
}
