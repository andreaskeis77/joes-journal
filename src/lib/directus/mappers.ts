/**
 * Maps Directus wire shapes into the camelCase domain types used by the
 * Astro components. Pure functions — easy to unit test against fixtures.
 */
import type {
  RestaurantStub,
  ReviewStub,
  ArticleStub,
  RecipeStub,
  CocktailStub,
  EquipmentStub,
  IngredientStub,
  SupplierStub,
  CollectionStub,
  LinkStub,
  RestaurantStatus,
  RecipeDifficulty,
  CocktailType,
} from "../../data/stub";
import type {
  DirectusRestaurant,
  DirectusReview,
  DirectusArticle,
  DirectusRecipe,
  DirectusCocktail,
  DirectusEquipment,
  DirectusIngredient,
  DirectusSupplier,
  DirectusContentCollection,
  DirectusLink,
} from "./schema";
import {
  collectionTypeLabel,
  equipmentStatusLabel,
  normalizeCollectionType,
  normalizeEquipmentStatus,
  normalizeRestaurantStatus,
  normalizeReviewStatus,
  restaurantStatusLabel,
} from "./labels";

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number") return value;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function asPriority(value: string): RestaurantStub["priority"] {
  if (value === "hoch" || value === "mittel" || value === "niedrig") return value;
  return "mittel";
}

function asDifficulty(value: string): RecipeDifficulty {
  if (value === "leicht" || value === "mittel" || value === "anspruchsvoll") return value;
  return "leicht";
}

function asCocktailType(value: string): CocktailType {
  return value === "alkoholfrei" ? "alkoholfrei" : "alkoholisch";
}

export function mapRestaurant(d: DirectusRestaurant): RestaurantStub {
  const status: RestaurantStatus = normalizeRestaurantStatus(d.status);
  const priceLevel = Math.min(4, Math.max(1, toNumber(d.price_level, 2))) as 1 | 2 | 3 | 4;
  return {
    slug: d.slug,
    name: d.name,
    city: d.city ?? "",
    region: d.region ?? "",
    cuisine: d.cuisine ?? "",
    priceLevel,
    priority: asPriority(d.priority),
    status,
    statusLabel: restaurantStatusLabel(d.status),
    tags: d.tags ?? [],
    image: d.image ?? "",
    website: d.website ?? undefined,
    reservationUrl: d.reservation_url ?? undefined,
    mapsUrl: d.maps_url ?? undefined,
    note: d.note ?? "",
    // reviewSlug is set in the loader, not the mapper, since the API
    // response does not include the reverse relation by default.
    reviewSlug: undefined,
  };
}

export function mapReview(d: DirectusReview): ReviewStub {
  const restaurantSlug =
    typeof d.restaurant === "string" ? d.restaurant : (d.restaurant?.slug ?? "");
  return {
    slug: d.slug,
    title: d.title,
    restaurantSlug,
    visitedOn: d.visited_on ?? "",
    rating: toNumber(d.rating, 0),
    excerpt: d.excerpt ?? "",
    // WYSIWYG-HTML-String. Alte Daten (string[] aus dem Repeater) werden hier
    // sicher auf "" verworfen, bis das Feld im Editor neu geschrieben wird –
    // identisch zur Artikel-Reparatur, schützt vor "[object Object]".
    body: typeof d.body === "string" ? d.body : "",
    image: d.image ?? "",
    galleryImages: d.gallery_images ?? [],
    // Pass the real editorial status through. derive() drops anything that is
    // not "published" so drafts/internal notes never reach the static output.
    status: normalizeReviewStatus(d.status),
  };
}

export function mapArticle(d: DirectusArticle): ArticleStub {
  return {
    slug: d.slug,
    title: d.title,
    // Pass the real editorial status through; derive() drops anything that is
    // not "published" so drafts/internal notes never reach the static output.
    status: normalizeReviewStatus(d.status),
    eyebrow: d.eyebrow ?? undefined,
    summary: d.summary ?? "",
    // WYSIWYG-HTML-String. Alte Daten (string[] aus dem Repeater) werden hier
    // sicher auf "" verworfen, bis das Feld im Editor neu geschrieben wird.
    body: typeof d.body === "string" ? d.body : "",
    image: d.image ?? "",
    galleryImages: d.gallery_images ?? [],
    publishedDate: d.published_date ?? "",
    tags: d.tags ?? [],
    relatedRestaurantSlugs: d.related_restaurant_slugs ?? [],
    relatedRecipeSlugs: d.related_recipe_slugs ?? [],
    relatedCocktailSlugs: d.related_cocktail_slugs ?? [],
    seoTitle: d.seo_title ?? undefined,
    seoDescription: d.seo_description ?? undefined,
  };
}

export function mapRecipe(d: DirectusRecipe): RecipeStub {
  return {
    slug: d.slug,
    title: d.title,
    image: d.image ?? "",
    summary: d.summary ?? "",
    servings: toNumber(d.servings, 2),
    prepMin: toNumber(d.prep_min, 0),
    cookMin: toNumber(d.cook_min, 0),
    difficulty: asDifficulty(d.difficulty),
    tags: d.tags ?? [],
    ingredients: (d.ingredients ?? []).map((i) => ({
      amount: i.amount,
      item: i.item,
      ingredientSlug: i.ingredient_slug ?? undefined,
    })),
    steps: d.steps ?? [],
    equipmentSlugs: d.equipment_slugs ?? [],
    notes: d.notes ?? undefined,
  };
}

export function mapCocktail(d: DirectusCocktail): CocktailStub {
  return {
    slug: d.slug,
    name: d.name,
    image: d.image ?? "",
    type: asCocktailType(d.type),
    glass: d.glass ?? "",
    ice: d.ice ?? "",
    technique: d.technique ?? "",
    flavorProfile: d.flavor_profile ?? "",
    pours: (d.pours ?? []).map((p) => ({
      amount: p.amount,
      item: p.item,
      ingredientSlug: p.ingredient_slug ?? undefined,
    })),
    garnish: d.garnish ?? "",
    preparation: d.preparation ?? [],
    variants: d.variants ?? undefined,
  };
}

export function mapEquipment(d: DirectusEquipment): EquipmentStub {
  return {
    slug: d.slug,
    name: d.name,
    image: d.image ?? "",
    category: d.category ?? "",
    status: normalizeEquipmentStatus(d.status),
    statusLabel: equipmentStatusLabel(d.status),
    manufacturer: d.manufacturer ?? undefined,
    model: d.model ?? undefined,
    productUrl: d.product_url ?? undefined,
    note: d.note ?? "",
    linkedRecipes: d.linked_recipe_slugs ?? [],
    linkedCocktails: d.linked_cocktail_slugs ?? [],
  };
}

export function mapIngredient(d: DirectusIngredient): IngredientStub {
  return {
    slug: d.slug,
    name: d.name,
    image: d.image ?? "",
    category: d.category ?? "",
    note: d.note ?? "",
    supplierSlugs: d.supplier_slugs ?? [],
  };
}

export function mapSupplier(d: DirectusSupplier): SupplierStub {
  return {
    slug: d.slug,
    name: d.name,
    type: d.type ?? "",
    city: d.city ?? "",
    website: d.website ?? undefined,
    note: d.note ?? "",
  };
}

export function mapCollection(d: DirectusContentCollection): CollectionStub {
  const type = normalizeCollectionType(d.type);
  return {
    slug: d.slug,
    title: d.title,
    image: d.image ?? "",
    type,
    typeLabel: collectionTypeLabel(d.type),
    description: d.description ?? "",
    restaurantSlugs: d.restaurant_slugs ?? [],
    recipeSlugs: d.recipe_slugs ?? [],
    cocktailSlugs: d.cocktail_slugs ?? [],
    equipmentSlugs: d.equipment_slugs ?? [],
  };
}

export function mapLink(d: DirectusLink): LinkStub {
  return {
    url: d.url,
    label: d.label,
    source: d.source ?? "",
    restaurantSlug: d.restaurant_slug ?? undefined,
    recipeSlug: d.recipe_slug ?? undefined,
    cocktailSlug: d.cocktail_slug ?? undefined,
    equipmentSlug: d.equipment_slug ?? undefined,
  };
}
