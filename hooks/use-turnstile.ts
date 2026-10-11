"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  TURNSTILE_BYPASS_TOKEN,
  TURNSTILE_WIDGET_ENABLED,
} from "@/lib/turnstile-widget";
import type { TurnstileWidgetId } from "@/types/turnstile";

export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export type TurnstileController = {
  /** Empty string when the widget is not configured for this environment. */
  siteKey: string;
  /** Callback ref for the element the widget mounts into. */
  setContainer: (node: HTMLDivElement | null) => void;
  /** Renders the widget once both the script and the container exist. Idempotent. */
  render: () => void;
  /** Clears the solved token and asks Cloudflare for a fresh challenge. */
  reset: () => void;
};

type UseTurnstileOptions = {
  /** Stable Turnstile `data-action` from `@/types/turnstile`. */
  action: string;
  /** Receives a solved token, or `""` when it is cleared, expired, or errored. */
  onTokenChange: (token: string) => void;
};

/**
 * Owns the Cloudflare Turnstile widget lifecycle for a single form: explicit
 * render, token propagation, and reset after submit.
 */
export function useTurnstile({
  action,
  onTokenChange,
}: UseTurnstileOptions): TurnstileController {
  const container = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<TurnstileWidgetId | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!TURNSTILE_WIDGET_ENABLED) {
      onTokenChangeRef.current(TURNSTILE_BYPASS_TOKEN);
    }
  }, []);

  const render = useCallback(() => {
    if (
      !TURNSTILE_WIDGET_ENABLED ||
      !TURNSTILE_SITE_KEY ||
      !container.current ||
      !window.turnstile ||
      widgetId.current !== null
    ) {
      return;
    }

    widgetId.current = window.turnstile.render(container.current, {
      sitekey: TURNSTILE_SITE_KEY,
      action,
      callback: (token) => onTokenChangeRef.current(token),
      "error-callback": () => onTokenChangeRef.current(""),
      "expired-callback": () => onTokenChangeRef.current(""),
    });
  }, [action]);

  // The script and the container can become ready in either order, so try to
  // render from both sides; `render` no-ops until both are present.
  const setContainer = useCallback(
    (node: HTMLDivElement | null) => {
      container.current = node;
      if (node) render();
    },
    [render],
  );

  const reset = useCallback(() => {
    if (!TURNSTILE_WIDGET_ENABLED) {
      onTokenChangeRef.current(TURNSTILE_BYPASS_TOKEN);
      return;
    }
    if (widgetId.current !== null && window.turnstile) {
      window.turnstile.reset(widgetId.current);
    }
    onTokenChangeRef.current("");
  }, []);

  return { siteKey: TURNSTILE_SITE_KEY, setContainer, render, reset };
}
