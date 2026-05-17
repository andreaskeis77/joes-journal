import { describe, expect, it } from "vitest";
import {
  mapCocktail,
  mapCollection,
  mapEquipment,
  mapIngredient,
  mapLink,
  mapRecipe,
  mapRestaurant,
  mapReview,
  mapSupplier,
} from "./mappers";
import type {
  DirectusCocktail,
  DirectusContentCollection,
  DirectusEquipment,
  DirectusIngredient,
  DirectusLink,
  DirectusRecipe,
  DirectusRestaurant,
  DirectusReview,
  DirectusSupplier,
} from "./schema";

describe("mapRestaurant", () => {
  const base: DirectusRestaurant = {
    id: "abc",
    slug: "le-bistro-discret",
    name: "Le Bistro Discret",
    status: "reviewed",
    priority: "hoch",
    city: "Paris",
    region: "Île-de-France",
    cuisine: "Französisch · Bistro",
    price_level: 3,
    tags: ["bistro", "klassik"],
    note: "Bistro-Klassik mit ruhiger Hand.",
    image: "/assets/restaurants/foo.webp",
    website: "https://example.test/foo",
    reservation_url: null,
    maps_url: null,
  };

  it("maps snake_case to camelCase and resolves status label", () => {
    const out = mapRestaurant(base);
    expect(out.slug).toBe("le-bistro-discret");
    expect(out.priceLevel).toBe(3);
    expect(out.status).toBe("reviewed");
    expect(out.statusLabel).toBe("Kritik vorhanden");
    expect(out.priority).toBe("hoch");
    expect(out.tags).toEqual(["bistro", "klassik"]);
    expect(out.reservationUrl).toBeUndefined();
    // reviewSlug is filled in by the loader, not the mapper.
    expect(out.reviewSlug).toBeUndefined();
  });

  it("normalises unknown status into UI buckets", () => {
    const out = mapRestaurant({ ...base, status: "discovered" });
    expect(out.status).toBe("wishlist");
    expect(out.statusLabel).toBe("Entdeckt");
  });

  it("clamps price_level into 1–4 range", () => {
    expect(mapRestaurant({ ...base, price_level: 0 }).priceLevel).toBe(1);
    expect(mapRestaurant({ ...base, price_level: 99 }).priceLevel).toBe(4);
    expect(mapRestaurant({ ...base, price_level: null }).priceLevel).toBe(2);
  });

  it("defaults priority to 'mittel' for unknown values", () => {
    const out = mapRestaurant({ ...base, priority: "bogus" });
    expect(out.priority).toBe("mittel");
  });
});

describe("mapReview", () => {
  it("extracts restaurant slug from nested object", () => {
    const review: DirectusReview = {
      id: "r1",
      slug: "berlin-fine-dining-fruehlingsmenue",
      title: "Frühlingsmenü mit ruhiger Hand",
      status: "published",
      restaurant: { slug: "restaurant-ohne-namen" },
      visited_on: "2026-04-18",
      rating: 4.5,
      excerpt: "Sechs Gänge…",
      body: ["Absatz eins", "Absatz zwei"],
      image: "/assets/reviews/foo.webp",
      gallery_images: ["/g1.webp"],
    };
    const out = mapReview(review);
    expect(out.restaurantSlug).toBe("restaurant-ohne-namen");
    expect(out.rating).toBe(4.5);
    expect(out.body).toHaveLength(2);
    expect(out.galleryImages).toEqual(["/g1.webp"]);
  });

  it("accepts string rating from Directus decimal", () => {
    const review: DirectusReview = {
      id: "r2",
      slug: "x",
      title: "x",
      status: "published",
      restaurant: "uuid-only",
      visited_on: null,
      rating: "4.0",
      excerpt: null,
      body: null,
      image: null,
      gallery_images: null,
    };
    const out = mapReview(review);
    expect(out.rating).toBe(4);
    expect(out.body).toEqual([]);
    expect(out.galleryImages).toEqual([]);
    expect(out.restaurantSlug).toBe("uuid-only");
  });
});

describe("mapRecipe", () => {
  it("maps ingredients with optional ingredient_slug", () => {
    const recipe: DirectusRecipe = {
      id: "rc1",
      slug: "fruehlingsgemuese-pfanne",
      title: "Frühlingsgemüse aus der Pfanne",
      image: "/i.webp",
      summary: "Schnell.",
      servings: 2,
      prep_min: 10,
      cook_min: 8,
      difficulty: "leicht",
      tags: ["frühling", "schnell"],
      ingredients: [
        { amount: "200 g", item: "Karotten", ingredient_slug: "saisongemuese" },
        { amount: "1 EL", item: "Salz", ingredient_slug: null },
      ],
      steps: ["Schritt 1", "Schritt 2"],
      equipment_slugs: ["cast-iron-pan"],
      notes: null,
    };
    const out = mapRecipe(recipe);
    expect(out.prepMin).toBe(10);
    expect(out.cookMin).toBe(8);
    expect(out.ingredients).toEqual([
      { amount: "200 g", item: "Karotten", ingredientSlug: "saisongemuese" },
      { amount: "1 EL", item: "Salz", ingredientSlug: undefined },
    ]);
    expect(out.equipmentSlugs).toEqual(["cast-iron-pan"]);
    expect(out.notes).toBeUndefined();
  });

  it("falls back difficulty default for unknown values", () => {
    const out = mapRecipe({
      id: "x",
      slug: "x",
      title: "x",
      image: null,
      summary: null,
      servings: null,
      prep_min: null,
      cook_min: null,
      difficulty: "extreme",
      tags: null,
      ingredients: null,
      steps: null,
      equipment_slugs: null,
      notes: null,
    });
    expect(out.difficulty).toBe("leicht");
    expect(out.servings).toBe(2);
    expect(out.ingredients).toEqual([]);
  });
});

describe("mapCocktail", () => {
  it("normalises type and maps pours", () => {
    const cocktail: DirectusCocktail = {
      id: "c1",
      slug: "ginger-lime-mocktail",
      name: "Ginger Lime Mocktail",
      type: "alkoholfrei",
      glass: "Highball",
      ice: "klare Würfel",
      technique: "shake & strain",
      flavor_profile: "frisch",
      image: "/c.webp",
      pours: [
        { amount: "30 ml", item: "Ingwersaft", ingredient_slug: "ingwer-frisch" },
      ],
      garnish: "Limettenrad",
      preparation: ["Step 1"],
      variants: ["Variante A"],
    };
    const out = mapCocktail(cocktail);
    expect(out.type).toBe("alkoholfrei");
    expect(out.pours).toEqual([
      { amount: "30 ml", item: "Ingwersaft", ingredientSlug: "ingwer-frisch" },
    ]);
    expect(out.variants).toEqual(["Variante A"]);
  });

  it("defaults unknown type to alkoholisch", () => {
    const out = mapCocktail({
      id: "x",
      slug: "x",
      name: "x",
      type: "bogus",
      glass: null,
      ice: null,
      technique: null,
      flavor_profile: null,
      image: null,
      pours: null,
      garnish: null,
      preparation: null,
      variants: null,
    });
    expect(out.type).toBe("alkoholisch");
    expect(out.pours).toEqual([]);
  });
});

describe("mapEquipment", () => {
  it("maps status and linked slug arrays", () => {
    const equipment: DirectusEquipment = {
      id: "e1",
      slug: "cast-iron-pan",
      name: "Gusseisenpfanne",
      status: "owned",
      category: "Pfannen",
      manufacturer: null,
      model: null,
      product_url: null,
      image: "/p.webp",
      note: "Hauptpfanne.",
      linked_recipe_slugs: ["fruehlingsgemuese-pfanne"],
      linked_cocktail_slugs: [],
    };
    const out = mapEquipment(equipment);
    expect(out.status).toBe("owned");
    expect(out.statusLabel).toBe("Im Besitz");
    expect(out.linkedRecipes).toEqual(["fruehlingsgemuese-pfanne"]);
    expect(out.manufacturer).toBeUndefined();
  });

  it("buckets unknown status as wishlist", () => {
    const out = mapEquipment({
      id: "x",
      slug: "x",
      name: "x",
      status: "broken",
      category: null,
      manufacturer: null,
      model: null,
      product_url: null,
      image: null,
      note: null,
      linked_recipe_slugs: null,
      linked_cocktail_slugs: null,
    });
    expect(out.status).toBe("wishlist");
    expect(out.linkedRecipes).toEqual([]);
    expect(out.linkedCocktails).toEqual([]);
  });
});

describe("mapIngredient and mapSupplier", () => {
  it("maps ingredient supplier slugs", () => {
    const ing: DirectusIngredient = {
      id: "i1",
      slug: "bio-zitronen",
      name: "Bio-Zitronen",
      category: "Obst",
      image: "/i.webp",
      note: "Unbehandelt.",
      supplier_slugs: ["bio-laden-um-die-ecke"],
    };
    expect(mapIngredient(ing).supplierSlugs).toEqual(["bio-laden-um-die-ecke"]);
  });

  it("maps supplier preserving website fallback", () => {
    const sup: DirectusSupplier = {
      id: "s1",
      slug: "wochenmarkt-stadtmitte",
      name: "Wochenmarkt",
      type: "Markt",
      city: "Berlin",
      website: null,
      note: "Mittwoch und Samstag.",
    };
    const out = mapSupplier(sup);
    expect(out.website).toBeUndefined();
    expect(out.type).toBe("Markt");
  });
});

describe("mapCollection", () => {
  it("maps manual collection with item slug arrays", () => {
    const col: DirectusContentCollection = {
      id: "col1",
      slug: "bbq-grill-notes",
      title: "BBQ & Grill Notes",
      type: "manual",
      image: "/c.webp",
      description: "Equipment, Methoden, Rezepte.",
      restaurant_slugs: [],
      recipe_slugs: ["geschmorte-tomaten-rosmarin"],
      cocktail_slugs: [],
      equipment_slugs: ["kamado-grill"],
    };
    const out = mapCollection(col);
    expect(out.type).toBe("manual");
    expect(out.typeLabel).toBe("Manuelle Sammlung");
    expect(out.recipeSlugs).toEqual(["geschmorte-tomaten-rosmarin"]);
  });

  it("maps saved_view type with correct label", () => {
    const col: DirectusContentCollection = {
      id: "col2",
      slug: "watchlist-mit-hoher-prio",
      title: "Watchlist mit Priorität",
      type: "saved_view",
      image: null,
      description: null,
      restaurant_slugs: null,
      recipe_slugs: null,
      cocktail_slugs: null,
      equipment_slugs: null,
    };
    const out = mapCollection(col);
    expect(out.type).toBe("saved_view");
    expect(out.typeLabel).toBe("Dynamische Sicht");
    expect(out.restaurantSlugs).toEqual([]);
  });
});

describe("mapLink", () => {
  it("nulls become undefined for optional slug fields", () => {
    const link: DirectusLink = {
      id: "l1",
      url: "https://example.test/a",
      label: "Label A",
      source: "example.test",
      restaurant_slug: "le-bistro-discret",
      recipe_slug: null,
      cocktail_slug: null,
      equipment_slug: null,
    };
    const out = mapLink(link);
    expect(out.restaurantSlug).toBe("le-bistro-discret");
    expect(out.recipeSlug).toBeUndefined();
    expect(out.cocktailSlug).toBeUndefined();
  });
});
