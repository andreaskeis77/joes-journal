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
    articles: [
      {
        slug: "art-new",
        title: "Newer article",
        status: "published",
        summary: "A summary.",
        body: "<p>Body paragraph</p>",
        image: "/a.webp",
        galleryImages: [],
        publishedDate: "2026-05-10",
        tags: ["essay"],
        relatedRestaurantSlugs: [],
        relatedRecipeSlugs: [],
        relatedCocktailSlugs: [],
      },
      {
        slug: "art-old",
        title: "Older article",
        status: "published",
        summary: "Older summary.",
        body: "",
        image: "/a2.webp",
        galleryImages: [],
        publishedDate: "2026-02-01",
        tags: [],
        relatedRestaurantSlugs: [],
        relatedRecipeSlugs: [],
        relatedCocktailSlugs: [],
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

  it("sorts articles by published_date descending and indexes them", () => {
    const bundle = derive(makeRaw());
    expect(bundle.articlesByDateDesc.map((a) => a.slug)).toEqual(["art-new", "art-old"]);
    expect(bundle.articleBySlug.get("art-new")?.title).toBe("Newer article");
    const articleEntry = bundle.searchIndex.find((e) => e.kind === "article");
    expect(articleEntry?.href).toBe("/journal/art-new");
    expect(articleEntry?.kindLabel).toBe("Journal");
  });

  it("drops non-published articles from every derived view (editorial gate)", () => {
    const base = makeRaw();
    const draft = {
      slug: "art-draft",
      title: "Secret article draft",
      status: "draft" as const,
      summary: "Should never be public.",
      body: "<p>internal</p>",
      image: "/d.webp",
      galleryImages: [],
      publishedDate: "2026-05-25",
      tags: [],
      relatedRestaurantSlugs: [],
      relatedRecipeSlugs: [],
      relatedCocktailSlugs: [],
    };
    const internal = { ...draft, slug: "art-internal", status: "internal" as const };
    const archived = { ...draft, slug: "art-archived", status: "archived" as const };
    const bundle = derive({ ...base, articles: [...base.articles, draft, internal, archived] });

    expect(bundle.articles.map((a) => a.slug).sort()).toEqual(["art-new", "art-old"]);
    expect(bundle.articleBySlug.has("art-draft")).toBe(false);
    expect(bundle.articleBySlug.has("art-internal")).toBe(false);
    expect(bundle.articleBySlug.has("art-archived")).toBe(false);
    expect(bundle.articlesByDateDesc.some((a) => a.slug === "art-draft")).toBe(false);
    expect(
      bundle.searchIndex.some((e) => e.kind === "article" && e.title === "Secret article draft"),
    ).toBe(false);
  });

  it("drops non-published reviews from every derived view (editorial gate)", () => {
    const base = makeRaw();
    const draft = {
      slug: "rev-draft",
      title: "Secret draft",
      restaurantSlug: "a",
      visitedOn: "2026-05-01",
      rating: 5,
      excerpt: "Should never be public.",
      body: ["internal note"],
      image: "/d.webp",
      galleryImages: [],
      status: "draft" as const,
    };
    const internal = { ...draft, slug: "rev-internal", status: "internal" as const };
    const archived = { ...draft, slug: "rev-archived", status: "archived" as const };
    const bundle = derive({ ...base, reviews: [...base.reviews, draft, internal, archived] });

    // Exported array only carries the two published reviews.
    expect(bundle.reviews.map((r) => r.slug).sort()).toEqual(["rev-a", "rev-older"]);
    // Slug map, date-sorted list and search index never surface non-published.
    expect(bundle.reviewBySlug.has("rev-draft")).toBe(false);
    expect(bundle.reviewBySlug.has("rev-internal")).toBe(false);
    expect(bundle.reviewBySlug.has("rev-archived")).toBe(false);
    expect(bundle.reviewsByDateDesc.some((r) => r.slug === "rev-draft")).toBe(false);
    expect(bundle.searchIndex.some((e) => e.kind === "review" && e.title === "Secret draft")).toBe(
      false,
    );
  });
});
