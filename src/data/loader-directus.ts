/**
 * Build-time Directus loader. Pulls every domain collection in parallel
 * and maps Directus wire shapes into the domain types used by Astro pages.
 *
 * Throws on connection or auth errors so the build fails loudly — that is
 * usually safer than producing a static site with partial data.
 */
import { createAuthenticatedClient, fetchAllRaw } from "../lib/directus/client";
import {
  mapArticle,
  mapCocktail,
  mapCollection,
  mapEquipment,
  mapIngredient,
  mapLink,
  mapRecipe,
  mapRestaurant,
  mapReview,
  mapSupplier,
} from "../lib/directus/mappers";
import type { RawData } from "./derive";

export async function loadFromDirectus(): Promise<RawData> {
  const client = await createAuthenticatedClient();
  const raw = await fetchAllRaw(client);

  const restaurants = raw.restaurants.map(mapRestaurant);
  const reviews = raw.reviews.map(mapReview);

  // Backfill the inverse relation: each restaurant's reviewSlug is derived
  // from the reviews list rather than from a nested SDK query, so we don't
  // depend on an o2m alias field existing on the restaurants collection.
  const reviewSlugByRestaurantSlug = new Map<string, string>();
  for (const rv of reviews) {
    if (rv.restaurantSlug && !reviewSlugByRestaurantSlug.has(rv.restaurantSlug)) {
      reviewSlugByRestaurantSlug.set(rv.restaurantSlug, rv.slug);
    }
  }
  for (const r of restaurants) {
    r.reviewSlug = reviewSlugByRestaurantSlug.get(r.slug);
  }

  return {
    restaurants,
    reviews,
    articles: raw.articles.map(mapArticle),
    recipes: raw.recipes.map(mapRecipe),
    cocktails: raw.cocktails.map(mapCocktail),
    equipment: raw.equipment.map(mapEquipment),
    ingredients: raw.ingredients.map(mapIngredient),
    suppliers: raw.suppliers.map(mapSupplier),
    collections: raw.collections.map(mapCollection),
    links: raw.links.map(mapLink),
  };
}
