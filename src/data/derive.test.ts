import { describe, expect, it } from "vitest";
import { derive } from "./derive";
import type { RawData } from "./derive";

function makeRaw(overrides: Partial<RawData> = {}): RawData {
  const base: RawData = {
    restaurants: [
      {
        slug: "a",
        name: "A",
        city: "Berlin",
        region: "Berlin",
        cuisine: "Modern",
        priceLevel: 3,
        priority: "hoch",
        status: "reviewed",
        statusLabel: "Kritik vorhanden",
        tags: ["fine-dining"],
        image: "/a.webp",
        note: "",
        reviewSlug: "rev-a",
      },
      {
        slug: "b",
        name: "B",
        city: "Berlin",
        region: "Berlin",
        cuisine: "Bistro",
        priceLevel: 2,
        priority: "mittel",
        status: "wishlist",
        statusLabel: "Merkliste",
        tags: [],
        image: "/b.webp",
        note: "",
      },
      {
        slug: "c",
        name: "C",
        city: "Paris",
        region: "Île-de-France",
        cuisine: "Bistro",
        priceLevel: 2,
        priority: "mittel",
        status: "planned",
        statusLabel: "Geplant",
        tags: [],
        image: "/c.webp",
        note: "",
      },
    ],
    reviews: [
      {
        slug: "rev-a",
        title: "A review",
        restaurantSlug: "a",
        visitedOn: "2026-04-18",
        rating: 4.5,
        excerpt: "Good.",
        body: ["Paragraph"],
        image: "/r.webp",
        galleryImages: [],
        status: "published",
      },
      {
        slug: "rev-older",
        title: "Older review",
        restaurantSlug: "a",
        visitedOn: "2026-01-01",
        rating: 4,
        excerpt: "OK.",
        body: [],
        image: "/r2.webp",
        galleryImages: [],
        status: "published",
      },
    ],
    recipes: [
      {
        slug: "rec-1",
        title: "Recipe 1",
        image: "/x.webp",
        summary: "Summary",
        servings: 2,
        prepMin: 10,
        cookMin: 8,
        difficulty: "leicht",
        tags: ["frühling"],
        ingredients: [{ amount: "1", item: "Salt" }],
        steps: ["Cook"],
        equipmentSlugs: [],
      },
    ],
    cocktails: [
      {
        slug: "alk",
        name: "Whiskey Sour",
        image: "/x.webp",
        type: "alkoholisch",
        glass: "Tumbler",
        ice: "rocks",
        technique: "shake",
        flavorProfile: "sour",
        pours: [{ amount: "60 ml", item: "Whiskey" }],
        garnish: "Cherry",
        preparation: ["Shake"],
      },
      {
        slug: "free",
        name: "Mocktail",
        image: "/x.webp",
        type: "alkoholfrei",
        glass: "Highball",
        ice: "cubes",
        technique: "build",
        flavorProfile: "fresh",
        pours: [{ amount: "100 ml", item: "Soda" }],
        garnish: "Lime",
        preparation: ["Build"],
      },
    ],
    equipment: [
      {
        slug: "knife",
        name: "Knife",
        image: "/x.webp",
        category: "Messer",
        status: "owned",
        statusLabel: "Im Besitz",
        note: "",
        linkedRecipes: [],
        linkedCocktails: [],
      },
      {
        slug: "grill",
        name: "Grill",
        image: "/x.webp",
        category: "Grill",
        status: "wishlist",
        statusLabel: "Wunschliste",
        note: "",
        linkedRecipes: [],
        linkedCocktails: [],
      },
    ],
    ingredients: [],
    suppliers: [],
    collections: [],
    links: [],
  };
  return { ...base, ...overrides };
}

describe("derive", () => {
  it("builds slug Maps for every collection", () => {
    const bundle = derive(makeRaw());
    expect(bundle.restaurantBySlug.get("a")?.name).toBe("A");
    expect(bundle.reviewBySlug.get("rev-a")?.title).toBe("A review");
    expect(bundle.recipeBySlug.get("rec-1")?.title).toBe("Recipe 1");
    expect(bundle.cocktailBySlug.get("alk")?.name).toBe("Whiskey Sour");
    expect(bundle.equipmentBySlug.get("knife")?.name).toBe("Knife");
  });

  it("sorts reviews by visited_on descending", () => {
    const bundle = derive(makeRaw());
    expect(bundle.reviewsByDateDesc.map((r) => r.slug)).toEqual(["rev-a", "rev-older"]);
  });

  it("counts top cities sorted by count then name", () => {
    const bundle = derive(makeRaw());
    expect(bundle.topCities[0]).toEqual({ city: "Berlin", count: 2 });
    expect(bundle.topCities[1]).toEqual({ city: "Paris", count: 1 });
  });

  it("counts equipment and cocktails by status/type", () => {
    const bundle = derive(makeRaw());
    expect(bundle.ownedEquipmentCount).toBe(1);
    expect(bundle.wishlistEquipmentCount).toBe(1);
    expect(bundle.alcoholFreeCocktailCount).toBe(1);
  });

  it("computes the four MVP restaurant stats", () => {
    const bundle = derive(makeRaw());
    const byLabel = Object.fromEntries(bundle.stats.map((s) => [s.label, s.value]));
    expect(byLabel["Restaurants insgesamt"]).toBe(3);
    expect(byLabel["Mit Kritik"]).toBe(1);
    expect(byLabel["Auf der Watchlist"]).toBe(2);
    expect(byLabel["Top-Städte"]).toBe(2);
  });

  it("builds search index entries for every content kind that has data", () => {
    const bundle = derive(makeRaw());
    const kinds = new Set(bundle.searchIndex.map((e) => e.kind));
    expect(kinds.has("restaurant")).toBe(true);
    expect(kinds.has("review")).toBe(true);
    expect(kinds.has("recipe")).toBe(true);
    expect(kinds.has("cocktail")).toBe(true);
    expect(kinds.has("equipment")).toBe(true);
  });

  it("search snippet for review references its restaurant", () => {
    const bundle = derive(makeRaw());
    const reviewEntry = bundle.searchIndex.find((e) => e.kind === "review");
    expect(reviewEntry?.snippet).toContain("A");
    expect(reviewEntry?.snippet).toContain("Berlin");
  });
});
