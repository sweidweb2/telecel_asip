"use client";

import { useEffect, useRef, useState } from "react";

const OPTION_SEARCH_DEBOUNCE_MS = 300;

/**
 * Local search string with a debounced value for reloading admin option pickers.
 * First enable applies immediately; later edits wait {@link OPTION_SEARCH_DEBOUNCE_MS}.
 */
export function useDebouncedOptionSearch(enabled: boolean) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const wasEnabledRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      wasEnabledRef.current = false;
      setSearch("");
      setDebouncedSearch("");
      return;
    }

    if (!wasEnabledRef.current) {
      wasEnabledRef.current = true;
      setSearch("");
      setDebouncedSearch("");
      return;
    }

    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim().slice(0, 100));
    }, OPTION_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [enabled, search]);

  return { search, setSearch, debouncedSearch };
}
