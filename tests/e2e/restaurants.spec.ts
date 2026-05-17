import { test, expect } from "@playwright/test";

test.describe("Restaurantliste", () => {
  test("zeigt alle Restaurants und filtert auf Watchlist", async ({ page }) => {
    await page.goto("/restaurants");

    await expect(page.getByRole("heading", { level: 1, name: /Watchlist & Besuche/i })).toBeVisible();

    const cards = page.locator(".grid > .grid-item:not([hidden])");
    const allCount = await cards.count();
    expect(allCount).toBeGreaterThanOrEqual(8);

    // Click the "Watchlist" filter chip.
    await page.getByRole("button", { name: /Watchlist/i }).click();

    // Now only wishlist/planned items are visible.
    const filteredCount = await cards.count();
    expect(filteredCount).toBeLessThan(allCount);
    expect(filteredCount).toBeGreaterThanOrEqual(1);

    // All visible cards must have status wishlist or planned.
    const statuses = await cards.evaluateAll((items) =>
      items.map((item) => (item as HTMLElement).getAttribute("data-status")),
    );
    for (const status of statuses) {
      expect(["wishlist", "planned"]).toContain(status);
    }
  });

  test("Restaurant-Detail mit Kritik zeigt Review-Card", async ({ page }) => {
    await page.goto("/restaurants/le-bistro-discret");
    await expect(page.getByRole("heading", { level: 1, name: "Le Bistro Discret" })).toBeVisible();
    await expect(page.getByText(/Bistro-Klassik, fein nachjustiert/)).toBeVisible();
    await expect(page.getByLabel(/Bewertung 4,0/)).toBeVisible();
  });

  test("Restaurant-Detail ohne Kritik zeigt Empty-State", async ({ page }) => {
    await page.goto("/restaurants/terrasse-am-park");
    await expect(page.getByRole("heading", { level: 1, name: "Terrasse am Park" })).toBeVisible();
    await expect(page.getByText(/Noch keine Kritik vorhanden/)).toBeVisible();
  });
});
