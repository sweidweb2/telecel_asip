"use client";

import { useEffect, useSyncExternalStore } from "react";

import { HttpStatusPage } from "@/components/layout/http-status-page";
import {
  HTTP_ERROR_PATHNAMES,
  httpErrorHref,
} from "@/constants/http-errors";

export type RouteErrorProps = {
  error: Error & { digest?: string };
  /** Next.js ≤16.2 recover callback. */
  reset?: () => void;
  /** Next.js ≥16.3 recover callback. */
  retry?: () => void;
  homeAsAnchor?: boolean;
};

function subscribeNoop() {
  return () => {};
}

function getIsHttpErrorPath() {
  return HTTP_ERROR_PATHNAMES.has(window.location.pathname);
}

function getServerIsHttpErrorPath() {
  return false;
}

/**
 * Segment / global error boundary UI.
 * Unexpected failures navigate to the themed `/500` page; status routes stay inline
 * so a failure on `/500` itself cannot loop.
 */
export function RouteError({
  error,
  homeAsAnchor = false,
}: RouteErrorProps) {
  const inline = useSyncExternalStore(
    subscribeNoop,
    getIsHttpErrorPath,
    getServerIsHttpErrorPath,
  );

  useEffect(() => {
    console.error(error);
    if (inline) return;

    window.location.replace(
      httpErrorHref("500", { digest: error.digest }),
    );
  }, [error, inline]);

  return (
    <HttpStatusPage
      kind={inline ? "generic" : "500"}
      digest={error.digest}
      bare
      homeAsAnchor={homeAsAnchor}
    />
  );
}
