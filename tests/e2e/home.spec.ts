import { test, expect } from "@playwright/test";

test.describe("Startseite", () => {
  test("lädt und zeigt Hero, Suche und neueste Kritiken", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("Zum Fettigen Joe");

    await expect(page.getByRole("heading", { level: 1, name: "Zum Fettigen Joe" })).toBeVisible();

    await expect(page.getByPlaceholder(/Suche nach Restaurant/i)).toBeVisible();

    // Latest reviews section is present and shows at least one review.
    await expect(
      page.getByRole("heading", { name: /Aus der Restaurant-Schreibwerkstatt/i }),
    ).toBeVisible();
    const reviewCards = page.locator(".review-card");
    await expect(reviewCards.first()).toBeVisible();
    expect(await reviewCards.count()).toBeGreaterThanOrEqual(1);
  });

  test("Hero-CTAs verlinken auf Kritiken und Restaurants", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Neueste Kritiken" }).first()).toHaveAttribute(
      "href",
      "/kritiken",
    );
    await expect(page.getByRole("link", { name: "Restaurants entdecken" }).first()).toHaveAttribute(
      "href",
      "/restaurants",
    );
  });
});
