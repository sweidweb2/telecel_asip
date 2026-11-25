/**
 * Widget is off for now. Forms do not render Cloudflare Turnstile.
 * Server verification is skipped while this is false (see `verifyTurnstileToken`).
 * Set this to true to show the widget and require a real Cloudflare token again.
 */
export const TURNSTILE_WIDGET_ENABLED = false;

/** Stand-in token while the widget is disabled. Satisfies Zod min-length only. */
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
