"use client";

import { useEffect } from "react";

/** Shared confirm copy for in-app leave prompts (not used by `beforeunload`). */
export const UNSAVED_CHANGES_MESSAGE =
  "You have unsaved changes. Leave this page?";

/**
 * Warn before discarding a dirty editor form: refresh/close, same-origin
 * link clicks, and best-effort browser back.
 */
export function useUnsavedChangesGuard(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank") return;

      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr) return;
      if (
        hrefAttr.startsWith("#") ||
        hrefAttr.startsWith("mailto:") ||
        hrefAttr.startsWith("tel:")
      ) {
        return;
      }

      let url: URL;
      try {
        url = new URL(hrefAttr, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      const isHashOnly =
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash !== "";
      if (isHashOnly) return;

      if (!window.confirm(UNSAVED_CHANGES_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    history.pushState({ __unsavedGuard: true }, "");

    const onPopState = () => {
      if (!window.confirm(UNSAVED_CHANGES_MESSAGE)) {
        history.pushState({ __unsavedGuard: true }, "");
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onDocumentClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [enabled]);
}
