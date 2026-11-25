import { expect, test, type Page } from "@playwright/test";

/** Founders is a direct link in the primary bar (Text Pack v2: Alumni hidden). */
function foundersNavLink(page: Page) {
  return page
    .locator("header nav[aria-label='Primary']")
    .getByRole("link", { name: "Founders", exact: true });
}

const publicSlugs = [
  "",
  "/about",
  "/programme",
  "/founders",
  "/impact",
  "/partners",
  "/insights",
  "/register-interest",
  "/alumni",
  "/apply",
  "/contact",
  "/faq",
  "/terms",
  "/privacy",
] as const;

for (const locale of ["en", "fr"] as const) {
  for (const slug of publicSlugs) {
    const route = `/${locale}${slug}`;

    test(`${route} renders localized public chrome`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("body")).toBeVisible();
      await expect(page.locator("header").first()).toBeVisible();
      await expect(page.locator("footer").first()).toBeVisible();
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
    });
  }
}

test("bare public routes redirect to a supported locale", async ({ page }) => {
  await page.goto("/about");
  await expect(page).toHaveURL(/\/(en|fr)\/about$/);
});

test("language switch preserves the current public page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en/programme");
  await page.getByRole("button", { name: "Account and language" }).click();
  await page.getByRole("link", { name: "fr", exact: true }).click();
  await expect(page).toHaveURL(/\/fr\/programme$/);
});

test("alumni stays out of the primary navigation while on HOLD", async ({ page }) => {
  await page.goto("/en");
  await expect(foundersNavLink(page)).toHaveAttribute("href", "/en/founders");
  await expect(page.locator('header a[href="/en/alumni"]')).toHaveCount(0);
});

test("hero routes jump to the founder and investor pathways", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en");
  await page.getByRole("link", { name: "I'm an Investor" }).first().click();
  await expect(page).toHaveURL(/#investors$/);
  await expect(page.locator("#investors")).toBeInViewport();
});

test(
  "mobile navigation remains usable",
  { tag: "@smoke" },
  async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("link", { name: "About" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Alumni" })).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .locator('a[href="/en/apply"], a[href="/en/register-interest"]'),
  ).toBeVisible();
});

test("tablet navigation uses the sheet menu", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("/en");
  await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
  await expect(foundersNavLink(page)).toBeHidden();
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("link", { name: "About" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Alumni" })).toHaveCount(0);
});

test("desktop navigation keeps the primary routes in the main bar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en");
  await expect(
    page.locator("header").getByRole("link", { name: "About" }),
  ).toBeVisible();
  await expect(foundersNavLink(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
});

test("retired portfolio URLs resolve to the founders directory", async ({ page }) => {
  await page.goto("/en/portfolio");
  await expect(page).toHaveURL(/\/en\/founders$/);
});

test("inactive intake path redirects to the live path", async ({ page }) => {
  // Derive the live intake from the navbar CTA, then assert the other URL
  // redirects there. Avoids racing apply-register settings flips and does not
  // require both paths to stay put.
  await page.goto("/en");
  const cta = page
    .locator("header")
    .locator('a[href="/en/apply"], a[href="/en/register-interest"]')
    .first();
  await expect(cta).toBeVisible();
  const live = await cta.getAttribute("href");
  expect(live === "/en/apply" || live === "/en/register-interest").toBe(true);

  const inactive =
    live === "/en/apply" ? "/en/register-interest" : "/en/apply";

  await page.goto(inactive);
  await expect(page).toHaveURL(new RegExp(`${live!.replace(/\//g, "\\/")}$`), {
    timeout: 20_000,
  });
  await expect(page.locator("h1").first()).toBeVisible();
});

test("navbar primary CTA points at register-interest or apply", async ({
  page,
}) => {
  await page.goto("/en");
  const cta = page
    .locator("header")
    .locator('a[href="/en/apply"], a[href="/en/register-interest"]')
    .first();
  await expect(cta).toBeVisible();
  const href = await cta.getAttribute("href");
  expect(href === "/en/apply" || href === "/en/register-interest").toBe(true);
});

test("/lab is removed from public marketing", async ({ page }) => {
  const response = await page.goto("/en/lab");
  expect(response?.status()).toBe(404);
});
