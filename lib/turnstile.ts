import {
  TURNSTILE_BYPASS_TOKEN,
  TURNSTILE_WIDGET_ENABLED,
} from "@/lib/turnstile-widget";
import { TURNSTILE_CONTACT_ACTION } from "@/types/turnstile";

export { TURNSTILE_CONTACT_ACTION };

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TOKEN_MAX_LENGTH = 2048;
const SITEVERIFY_TIMEOUT_MS = 10_000;

/** Cloudflare published always-pass testing secret (local/E2E only). */
export const TURNSTILE_ALWAYS_PASS_SECRET =
  "1x0000000000000000000000000000000AA";

type TurnstileSiteverifyResponse = {
  success?: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

function expectedHostnames(): Set<string> {
  return new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  );
}

/**
 * Verifies a Turnstile token via Cloudflare siteverify.
 * Requires `TURNSTILE_SECRET` and a non-empty `TURNSTILE_HOSTNAMES` allowlist.
 *
 * Cloudflare's published always-pass test secret returns a fixed dummy
 * `action` (`"test"`), so action/hostname checks are skipped for that secret
 * only — production secrets still enforce both.
 */
export async function verifyTurnstileToken(options: {
  token: string;
  expectedAction: string;
  remoteip?: string;
}): Promise<boolean> {
  const { token, expectedAction, remoteip } = options;
  if (!TURNSTILE_WIDGET_ENABLED && token === TURNSTILE_BYPASS_TOKEN) {
    return true;
  }

  const hostnames = expectedHostnames();
  const secret = process.env.TURNSTILE_SECRET;

  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > TOKEN_MAX_LENGTH ||
    hostnames.size === 0 ||
    !secret
  ) {
    return false;
  }

  let result: TurnstileSiteverifyResponse;
  try {
    const body = new URLSearchParams({
      secret,
      response: token,
    });
    if (remoteip && remoteip !== "unknown") {
      body.set("remoteip", remoteip);
    }

    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
      body,
    });

    if (!response.ok) {
      return false;
    }

    result = (await response.json()) as TurnstileSiteverifyResponse;
  } catch {
    return false;
  }

  if (secret === TURNSTILE_ALWAYS_PASS_SECRET) {
    return result.success === true;
  }

  return (
    result.success === true &&
    result.action === expectedAction &&
    typeof result.hostname === "string" &&
    hostnames.has(result.hostname)
  );
}
