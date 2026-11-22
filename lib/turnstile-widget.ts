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
