import { test, expect } from "@playwright/test";

// The mobile drawer is the primary navigation below 1100px (FRONTEND_UX_SPEC §2).
// Run this only on the mobile viewport.
test.describe("Mobile Navigation", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 1100, "mobile only");

  test("öffnet Drawer und navigiert zu /restaurants", async ({ page }) => {
    await page.goto("/");

    // Drawer is initially hidden off-screen via transform.
    const drawer = page.locator("aside.mobile-drawer");
    await expect(drawer).toBeVisible(); // element exists in DOM
    const initialBox = await drawer.boundingBox();
    expect(initialBox?.x ?? 0).toBeGreaterThanOrEqual((page.viewportSize()?.width ?? 0) - 1);

    // Click the burger button to open the drawer.
    await page.locator("label.burger").click();

    // After opening, drawer is on-screen.
    await page.waitForTimeout(300);
    const openBox = await drawer.boundingBox();
    expect(openBox?.x ?? 0).toBeLessThan(page.viewportSize()?.width ?? 0);

    // Navigation links are reachable inside the drawer.
    const restaurantsLink = drawer.getByRole("link", { name: "Restaurants" });
    await expect(restaurantsLink).toBeVisible();
    await restaurantsLink.click();

    await expect(page).toHaveURL(/\/restaurants\/?$/);
    await expect(page.getByRole("heading", { level: 1, name: /Watchlist & Besuche/i })).toBeVisible();
  });
});
