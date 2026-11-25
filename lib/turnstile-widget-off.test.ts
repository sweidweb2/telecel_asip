import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/turnstile-widget", () => ({
  TURNSTILE_WIDGET_ENABLED: false,
  TURNSTILE_BYPASS_TOKEN: "turnstile-widget-disabled",
}));

import { verifyTurnstileToken } from "@/lib/turnstile";
import { TURNSTILE_CONTACT_ACTION } from "@/types/turnstile";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.unstubAllEnvs();
});

describe("verifyTurnstileToken (widget off)", () => {
  it("skips Cloudflare in every environment, including production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(
      verifyTurnstileToken({
        token: "anything",
        expectedAction: TURNSTILE_CONTACT_ACTION,
      }),
    ).resolves.toBe(true);
    await expect(
      verifyTurnstileToken({
        token: "",
        expectedAction: TURNSTILE_CONTACT_ACTION,
      }),
    ).resolves.toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
