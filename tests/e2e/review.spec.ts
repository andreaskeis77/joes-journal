import { test, expect } from "@playwright/test";

test.describe("Kritikdetail", () => {
  test("zeigt Titel, Bewertung und Restaurant-Link", async ({ page }) => {
    await page.goto("/kritiken/berlin-fine-dining-fruehlingsmenue");

    await expect(
      page.getByRole("heading", { level: 1, name: /Frühlingsmenü mit ruhiger Hand/ }),
    ).toBeVisible();

    // Rating element exposes ARIA label with numeric value (not only stars).
    const rating = page.getByLabel(/Bewertung 4,5 von 5/);
    await expect(rating).toBeVisible();

    // Linked restaurant present and clickable.
    const restaurantLink = page.getByRole("link", { name: "Restaurant ohne Namen" }).first();
    await expect(restaurantLink).toBeVisible();
    await expect(restaurantLink).toHaveAttribute("href", "/restaurants/restaurant-ohne-namen");
  });

  test("Kritikenliste verlinkt zur Detailseite", async ({ page }) => {
    await page.goto("/kritiken");
    await expect(
      page.getByRole("heading", { level: 1, name: /Aus der Restaurant-Schreibwerkstatt/ }),
    ).toBeVisible();

    const firstCardLink = page.locator(".review-card .review-link").first();
    await firstCardLink.click();
    await expect(page).toHaveURL(/\/kritiken\/[a-z-]+$/);
    await expect(page.locator("article.review-detail")).toBeVisible();
  });
});
