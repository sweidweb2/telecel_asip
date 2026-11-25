"use client";

import Script from "next/script";

import type { TurnstileController } from "@/hooks/use-turnstile";
import { TURNSTILE_WIDGET_ENABLED } from "@/lib/turnstile-widget";

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileFieldProps = {
  turnstile: TurnstileController;
  /** Current token value for the controlled hidden input. */
  token: string;
  hint: string;
  error?: string;
  testId: string;
};

/**
 * Controlled hidden `turnstileToken` input plus (when enabled) the Cloudflare
 * script, widget slot, and hint / error text. Pair with
 * {@link useFormTurnstile} in the owning form.
 */
export function TurnstileField({
  turnstile,
  token,
  hint,
  error,
  testId,
}: TurnstileFieldProps) {
  const { siteKey, setContainer, render } = turnstile;
  const hasToken = Boolean(token);

  return (
    <>
      <input
        type="hidden"
        name="turnstileToken"
        value={token}
        readOnly
        aria-hidden
        tabIndex={-1}
      />
      {TURNSTILE_WIDGET_ENABLED ? (
        <div className="grid gap-2">
          {siteKey ? (
            <Script
              src={TURNSTILE_SCRIPT_SRC}
              strategy="afterInteractive"
              onReady={render}
            />
          ) : null}
          {!hasToken && !error ? (
            <p className="text-xs leading-4 text-muted-foreground">{hint}</p>
          ) : null}
          <div ref={setContainer} className="min-h-16" data-testid={testId} />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      ) : null}
    </>
  );
}
