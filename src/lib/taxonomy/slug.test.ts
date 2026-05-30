import { describe, expect, it } from "vitest";
import { splitTerms, toTermSlug } from "./slug";

describe("toTermSlug", () => {
  it("transliterates German umlauts and sharp s", () => {
    expect(toTermSlug("Französisch")).toBe("franzoesisch");
    expect(toTermSlug("Süß")).toBe("suess");
    expect(toTermSlug("Öl & Essig")).toBe("oel-essig");
  });

  it("strips diacritics via NFKD (é -> e)", () => {
    expect(toTermSlug("Île-de-France")).toBe("ile-de-france");
    expect(toTermSlug("Café")).toBe("cafe");
  });

  it("collapses non-alphanumerics into single hyphens and trims them", () => {
    expect(toTermSlug("  Modern Europäisch  ")).toBe("modern-europaeisch");
    expect(toTermSlug("Natural Wine · Kleine Teller")).toBe("natural-wine-kleine-teller");
  });

  it("is idempotent (slug of a slug is the same)", () => {
    const once = toTermSlug("Französisch · Bistro");
    expect(toTermSlug(once)).toBe(once);
  });
});

describe("splitTerms", () => {
  it("splits composite cuisine strings on the middle dot", () => {
    expect(splitTerms("Französisch · Bistro")).toEqual(["Französisch", "Bistro"]);
  });

  it("splits on slash and comma and trims", () => {
    expect(splitTerms("Modern / Europäisch")).toEqual(["Modern", "Europäisch"]);
    expect(splitTerms("a, b ,c")).toEqual(["a", "b", "c"]);
  });

  it("drops empties", () => {
    expect(splitTerms("· Bistro ·")).toEqual(["Bistro"]);
    expect(splitTerms("")).toEqual([]);
  });
});
