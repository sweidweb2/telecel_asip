import { expect, test } from "@playwright/test";

test.describe("themed HTTP error pages", () => {
  test("403 access denied page renders", async ({ page }) => {
    await page.goto("/error/403");
    await expect(
      page.getByRole("heading", { name: "Access denied" }),
    ).toBeVisible();
    await expect(
      page.getByText(/do not have permission to view this page/i),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Go home" })).toBeVisible();
  });

  test("404 page not found renders", async ({ page }) => {
    await page.goto("/error/404");
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
    await expect(
      page.getByText(/does not exist or was moved/i),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Go home" })).toBeVisible();
  });

  test("500 server error page renders", async ({ page }) => {
    await page.goto("/error/500");
    await expect(
      page.getByRole("heading", { name: "Something went wrong" }),
    ).toBeVisible();
    await expect(
      page.getByText(/unexpected server error occurred/i),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Go home" })).toBeVisible();
  });

  test("503 service unavailable page renders", async ({ page }) => {
    await page.goto("/error/503");
    await expect(
      page.getByRole("heading", { name: "Service unavailable" }),
    ).toBeVisible();
    await expect(
      page.getByText(/temporarily unavailable/i),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Go home" })).toBeVisible();
  });

  test("generic /error redirects known codes to dedicated routes", async ({
    page,
  }) => {
    await page.goto("/error?code=404");
    await expect(page).toHaveURL(/\/error\/404/, { timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
  });

  test("generic /error without code shows fallback copy", async ({ page }) => {
    await page.goto("/error");
    await expect(
      page.getByRole("heading", { name: "Something went wrong" }),
    ).toBeVisible();
    await expect(
      page.getByText(/unexpected error occurred/i),
    ).toBeVisible();
  });
});
