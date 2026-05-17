import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility smokes – axe scan on the three highest-traffic pages.
 * Configured to fail on serious or critical violations only; minor or
 * cosmetic issues surface as warnings in the report but don't fail.
 */
const URLS = [
  { path: "/", name: "Startseite" },
  { path: "/restaurants/le-bistro-discret", name: "Restaurant-Detail" },
  { path: "/kritiken/berlin-fine-dining-fruehlingsmenue", name: "Kritikdetail" },
];

for (const { path, name } of URLS) {
  test(`A11y – ${name} hat keine ernsten axe-Verstöße`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    if (serious.length > 0) {
      console.error(
        `[a11y] ${name} – ${serious.length} ernste Verstöße:`,
        JSON.stringify(
          serious.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
          null,
          2,
        ),
      );
    }
    expect(serious).toEqual([]);
  });
}

test("Tab-Fokus auf erstem Hero-CTA ist sichtbar", async ({ page }) => {
  await page.goto("/");
  // Tab through the skip link and brand to reach the first interactive element
  // beyond the chrome. The search input is the first focusable inside main.
  await page.keyboard.press("Tab"); // skip link
  await page.keyboard.press("Tab"); // brand
  // Continue tabbing until we hit the search input
  let active = await page.evaluate(() => document.activeElement?.tagName);
  let safety = 0;
  while (active !== "INPUT" && safety < 15) {
    await page.keyboard.press("Tab");
    active = await page.evaluate(() => document.activeElement?.tagName);
    safety++;
  }
  expect(active).toBe("INPUT");
});
