/**
 * Widget is off for now. Forms do not render Cloudflare Turnstile, and the
 * server accepts {@link TURNSTILE_BYPASS_TOKEN} instead of a solved challenge
 * in local / preview only (see `verifyTurnstileToken`). Production rejects
 * the bypass unless `ALLOW_TURNSTILE_BYPASS=true`.
 * Set this to true to show the widget and require a real token again.
 */
export const TURNSTILE_WIDGET_ENABLED = false;

/** Stand-in token while the widget is disabled. Not a Cloudflare token. */
export const TURNSTILE_BYPASS_TOKEN = "turnstile-widget-disabled";

/** RHF default for `turnstileToken` — bypass when the widget is hidden. */
export function initialTurnstileToken(): string {
  return TURNSTILE_WIDGET_ENABLED ? "" : TURNSTILE_BYPASS_TOKEN;
}

/**
 * Prefer the first non-empty candidate. When the widget is off, always return
 * the bypass so submit cannot race an empty hidden field.
 */
export function resolveTurnstileToken(
  ...candidates: Array<string | undefined | null>
): string {
  if (!TURNSTILE_WIDGET_ENABLED) return TURNSTILE_BYPASS_TOKEN;
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }
  return "";
}
