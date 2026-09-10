"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "nextjs-toploader/app";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/** Shared leave-confirm copy (dialog body; not used by native `beforeunload`). */
export const UNSAVED_CHANGES_MESSAGE =
  "You have unsaved changes. If you leave now, they will be lost.";

type PendingNav =
  | { type: "href"; href: string }
  | { type: "back" };

/**
 * Warn before discarding a dirty editor form.
 * In-app leave uses AlertDialog; refresh/tab close still uses the browser prompt
 * (required by `beforeunload`).
 */
export function UnsavedChangesGuard({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<PendingNav | null>(null);

  const enabledRef = useRef(enabled);
  const openRef = useRef(open);
  const allowNextRef = useRef(false);
  const guardedUrlRef = useRef("");

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const requestLeave = useCallback((nav: PendingNav) => {
    setPending(nav);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!enabled) {
      allowNextRef.current = false;
      let cancelled = false;
      const id = window.setTimeout(() => {
        if (cancelled) return;
        setOpen(false);
        setPending(null);
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(id);
      };
    }

    guardedUrlRef.current =
      window.location.pathname + window.location.search + window.location.hash;
    history.pushState({ __unsavedGuard: true }, "", guardedUrlRef.current);

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (allowNextRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (allowNextRef.current || !enabledRef.current) return;
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

      const nextPath = url.pathname + url.search + url.hash;
      const isSameDocument =
        url.pathname === window.location.pathname &&
        url.search === window.location.search;
      if (isSameDocument && (url.hash === "" || url.hash === window.location.hash)) {
        return;
      }
      if (isSameDocument && url.hash !== "") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (openRef.current) return;
      requestLeave({ type: "href", href: nextPath });
    };

    const onPopState = () => {
      if (allowNextRef.current || !enabledRef.current) return;
      history.pushState(
        { __unsavedGuard: true },
        "",
        guardedUrlRef.current,
      );
      if (openRef.current) return;
      requestLeave({ type: "back" });
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onDocumentClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [enabled, requestLeave]);

  function handleContinue() {
    setOpen(false);
    setPending(null);
  }

  function handleDiscard() {
    const nav = pending;
    allowNextRef.current = true;
    setOpen(false);
    setPending(null);

    if (nav?.type === "href") {
      router.push(nav.href);
      return;
    }
    if (nav?.type === "back") {
      history.back();
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleContinue();
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>
            {UNSAVED_CHANGES_MESSAGE}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-11 sm:min-h-8">
            Continue editing
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11 sm:min-h-8"
            onClick={handleDiscard}
          >
            Discard
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
