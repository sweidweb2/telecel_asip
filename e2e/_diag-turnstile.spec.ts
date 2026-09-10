import { expect, test } from "@playwright/test";

test("diagnose turnstile after resolver map", async ({ page }) => {
  const failed: string[] = [];
  page.on("requestfailed", (r) => {
    failed.push(`${r.url()} :: ${r.failure()?.errorText}`);
  });

  await page.goto("/en/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(12_000);

  const info = await page.evaluate(() => {
    const tokenInput = document.querySelector(
      'input[name="turnstileToken"]',
    ) as HTMLInputElement | null;
    return {
      hasTurnstileApi: typeof window.turnstile !== "undefined",
      tokenLen: tokenInput?.value?.length ?? 0,
      iframeCount: document.querySelectorAll("iframe").length,
      iframeSrcs: [...document.querySelectorAll("iframe")].map((i) => i.src),
    };
  });

  console.log("[turnstile-diag]", JSON.stringify({ info, failed }, null, 2));
  expect(info.hasTurnstileApi).toBeTruthy();
});
