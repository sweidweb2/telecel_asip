import { expect, test } from "@playwright/test";

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
  await page.goto("/en/programme");
  await page.getByRole("link", { name: "fr", exact: true }).first().click();
  await expect(page).toHaveURL(/\/fr\/programme$/);
});

test("alumni is in the primary navigation", async ({ page }) => {
  await page.goto("/en");
  // Founders is a <details>/<summary> flyout (not NavigationMenu).
  await page.locator("header nav[aria-label='Primary'] summary").filter({
    hasText: "Founders",
  }).click();
  await expect(
    page.locator("header").getByRole("link", { name: "Alumni", exact: true }),
  ).toHaveAttribute("href", "/en/alumni");
});

test("mobile navigation remains usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("link", { name: "About" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Alumni" })).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .locator('a[href="/en/apply"], a[href="/en/register-interest"]'),
  ).toBeVisible();
});

test("tablet navigation keeps the primary routes visible", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("/en");
  await expect(
    page.locator("header").getByRole("link", { name: "About" }),
  ).toBeVisible();
  await expect(
    page.locator("header nav[aria-label='Primary'] summary").filter({
      hasText: "Founders",
    }),
  ).toBeVisible();
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
