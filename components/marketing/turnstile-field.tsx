"use client";

import Script from "next/script";

import type { TurnstileController } from "@/hooks/use-turnstile";

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileFieldProps = {
  turnstile: TurnstileController;
  /** True once the form holds a solved token. */
  hasToken: boolean;
  hint: string;
  error?: string;
  testId: string;
};

/**
 * Renders the Cloudflare script, the Turnstile widget slot, and its hint /
 * error text. Pair with {@link useTurnstile} in the owning form.
 */
export function TurnstileField({
  turnstile,
  hasToken,
  hint,
  error,
  testId,
}: TurnstileFieldProps) {
  const { siteKey, setContainer, render } = turnstile;

  return (
    <div className="grid gap-2">
      {siteKey ? (
        <Script
          src={TURNSTILE_SCRIPT_SRC}
          strategy="afterInteractive"
          onReady={render}
        />
      ) : null}
      <div ref={setContainer} className="min-h-16" data-testid={testId} />
      {!hasToken && !error ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
