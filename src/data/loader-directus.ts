/**
 * Build-time Directus loader. Pulls every domain collection in parallel
 * and maps Directus wire shapes into the domain types used by Astro pages.
 *
 * Throws on connection or auth errors so the build fails loudly — that is
 * usually safer than producing a static site with partial data.
 *
 * Image bake (E1.3): after mapping, image fields are resolved against the
 * uploads manifest. A Directus file reference that was downloaded by the
 * pre-build bake step (deploy/bake-files.mjs) wins over the legacy string path;
 * otherwise the string path is used unchanged. See src/lib/bake/manifest.ts.
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
import { resolveImage, rewriteBodyAssets, type UploadsManifest } from "../lib/bake/manifest";
import uploadsManifest from "./uploads-manifest.json";
import type { RawData } from "./derive";

const manifest = uploadsManifest as UploadsManifest;

/**
 * Resolves baked Directus files for a list of mapped items in place. `items`
 * and `raws` are index-aligned (map preserves order), so `raws[i].image_file`
 * is the file reference for `items[i]`.
 */
function bakeImages<T extends { image: string }>(
  items: T[],
  raws: Array<{ image_file?: string | null }>,
): T[] {
  items.forEach((item, i) => {
    item.image = resolveImage(item.image, raws[i]?.image_file ?? null, manifest);
  });
  return items;
}

export async function loadFromDirectus(): Promise<RawData> {
  const client = await createAuthenticatedClient();
  const raw = await fetchAllRaw(client);

  const restaurants = bakeImages(raw.restaurants.map(mapRestaurant), raw.restaurants);
  const reviews = bakeImages(raw.reviews.map(mapReview), raw.reviews);
  const articles = bakeImages(raw.articles.map(mapArticle), raw.articles);
  // Phase 2: Inline-Bilder im WYSIWYG-Body auf lokale /_uploads/-Pfade umschreiben
  // (der Bake hat sie zuvor heruntergeladen und ins Manifest aufgenommen).
  articles.forEach((a) => {
    a.body = rewriteBodyAssets(a.body, manifest);
  });
  const recipes = bakeImages(raw.recipes.map(mapRecipe), raw.recipes);
  const cocktails = bakeImages(raw.cocktails.map(mapCocktail), raw.cocktails);
  const equipment = bakeImages(raw.equipment.map(mapEquipment), raw.equipment);

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
    articles,
    recipes,
    cocktails,
    equipment,
    ingredients: raw.ingredients.map(mapIngredient),
    suppliers: raw.suppliers.map(mapSupplier),
    collections: raw.collections.map(mapCollection),
    links: raw.links.map(mapLink),
  };
}
