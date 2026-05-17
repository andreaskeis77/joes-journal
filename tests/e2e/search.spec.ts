import { test, expect } from "@playwright/test";

test.describe("Globale Suche", () => {
  test("findet Cocktail anhand des Namens", async ({ page }) => {
    await page.goto("/suche");
    await expect(page.getByRole("heading", { level: 1, name: /Alles im Journal durchsuchen/ })).toBeVisible();

    const input = page.getByPlaceholder(/Suche nach Restaurant/i);
    await input.fill("mocktail");

    // Cocktail group should still show at least one result, others should hide.
    const cocktailGroup = page.locator('section.group[data-group-kind="cocktail"]');
    await expect(cocktailGroup).toBeVisible();
    await expect(cocktailGroup.getByText(/Ginger Lime Mocktail/i)).toBeVisible();

    // Restaurant group has no match → hidden.
    await expect(page.locator('section.group[data-group-kind="restaurant"]')).toBeHidden();

    // Summary updates with hit count (matches "2 Treffer für „mocktail"" with typographic quotes).
    await expect(page.locator("[data-search-summary]")).toContainText(/Treffer für/);
    await expect(page.locator("[data-search-summary]")).toContainText("mocktail");
  });

  test("zeigt Empty-State bei unbekanntem Begriff", async ({ page }) => {
    await page.goto("/suche");
    await page.getByPlaceholder(/Suche nach Restaurant/i).fill("xyzdefinitelynotpresent");
    await expect(page.locator("[data-search-empty]")).toBeVisible();
  });

  test("liest ?q= aus URL und filtert vorab", async ({ page }) => {
    await page.goto("/suche?q=mocktail");
    const input = page.getByPlaceholder(/Suche nach Restaurant/i);
    await expect(input).toHaveValue("mocktail");
    await expect(page.locator('section.group[data-group-kind="cocktail"]')).toBeVisible();
    await expect(
      page.locator('section.group[data-group-kind="cocktail"]').getByText(/Ginger Lime Mocktail/i),
    ).toBeVisible();
  });
});
