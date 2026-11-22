import { expect, test, type Page } from "@playwright/test";

function foundersMenuButton(page: Page) {
  return page
    .locator("header nav[aria-label='Primary']")
    .getByRole("button", { name: "Founders", exact: true });
}

/** Opens the desktop Founders menu. Alumni is a menuitem, portaled outside the header. */
async function openFoundersMenu(page: Page) {
  await foundersMenuButton(page).click();
  return page.getByRole("menuitem", { name: "Alumni", exact: true });
}

/** Slim chrome sample — full en/fr slug grid demoted; key routes only. */
const publicChromeRoutes = [
  "/en",
  "/en/about",
  "/en/contact",
  "/en/apply",
  "/fr",
  "/fr/program",
] as const;

for (const route of publicChromeRoutes) {
  test(`${route} renders localized public chrome`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("footer").first()).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute(
      "lang",
      route.startsWith("/fr") ? "fr" : "en",
    );
  });
}

test(
  "bare public routes redirect to a supported locale",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveURL(/\/(en|fr)\/about$/);
  },
);

test(
  "language switch preserves the current public page",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.goto("/en/program");
    await page.getByRole("link", { name: "fr", exact: true }).first().click();
    // Canonical marketing slug is `program` in both locales (`/programme` redirects).
    await expect(page).toHaveURL(/\/fr\/program\/?$/);
  },
);

test("alumni is in the primary navigation", async ({ page }) => {
  await page.goto("/en");
  const alumni = await openFoundersMenu(page);
  await expect(alumni).toHaveAttribute("href", "/en/alumni");
});

test("founders directory closes when clicking outside", async ({ page }) => {
  await page.goto("/en");
  const alumni = await openFoundersMenu(page);
  await expect(alumni).toBeVisible();
  await page.locator("main").click({ position: { x: 10, y: 10 } });
  await expect(alumni).toBeHidden();
});

test(
  "mobile navigation remains usable",
  { tag: "@smoke" },
  async ({ page }) => {
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
  },
);

test("tablet navigation uses the sheet menu", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("/en");
  await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
  await expect(foundersMenuButton(page)).toBeHidden();
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("link", { name: "About" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Alumni" })).toBeVisible();
});

test("desktop navigation keeps the primary routes in the main bar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en");
  await expect(
    page.locator("header").getByRole("link", { name: "About" }),
  ).toBeVisible();
  await expect(foundersMenuButton(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
});

test("retired portfolio URLs resolve to the founders directory", async ({
  page,
}) => {
  await page.goto("/en/portfolio");
  await expect(page).toHaveURL(/\/en\/founders(\?.*)?$/);
});

test("inactive intake path redirects to the live path", async ({ page }) => {
  // Derive the live intake from the navbar CTA, then assert the other URL
  // redirects there. Avoids racing apply-register settings flips.
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

test(
  "navbar primary CTA points at register-interest or apply",
  { tag: "@smoke" },
  async ({ page }) => {
    await page.goto("/en");
    const cta = page
      .locator("header")
      .locator('a[href="/en/apply"], a[href="/en/register-interest"]')
      .first();
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute("href");
    expect(href === "/en/apply" || href === "/en/register-interest").toBe(true);
  },
);

test("/lab is removed from public marketing", async ({ page }) => {
  const response = await page.goto("/en/lab");
  expect(response?.status()).toBe(404);
});
