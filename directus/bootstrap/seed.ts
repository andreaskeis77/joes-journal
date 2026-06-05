/**
 * Seeds joes-journal Directus with realistic MVP data (per MVP_SCOPE §4):
 * 8 restaurants, 3 reviews, 3 recipes, 3 cocktails, 6 ingredients,
 * 3 suppliers, 4 equipment, 3 collections, 10 links + taxonomy terms.
 *
 * Data is ported from src/data/stub.ts (the Astro frontend's stub data),
 * so the seed and the (current) Astro stubs stay in lockstep until the
 * frontend switches to Directus.
 *
 * Idempotent: on re-run, skips entries whose slug (or url) already exists.
 */
import { createItem, readItems } from "@directus/sdk";
import { authenticatedClient, type Client } from "./client.js";
import { toTermSlug } from "../../src/lib/taxonomy/slug.ts";

import {
  restaurants as stubRestaurants,
  reviews as stubReviews,
  articles as stubArticles,
  recipes as stubRecipes,
  cocktails as stubCocktails,
  equipment as stubEquipment,
  ingredients as stubIngredients,
  suppliers as stubSuppliers,
  collections as stubCollections,
  links as stubLinks,
} from "../../src/data/stub.ts";

interface DirectusItem {
  id: string;
  slug?: string;
  url?: string;
}

async function existingSlugs(client: Client, collection: string): Promise<Map<string, string>> {
  const items = (await client.request(
    readItems(
      collection as never,
      {
        fields: ["id", "slug"] as never,
        limit: -1 as never,
      } as never,
    ),
  )) as DirectusItem[];
  return new Map(items.filter((i) => i.slug).map((i) => [i.slug as string, i.id]));
}

async function existingLinkUrls(client: Client): Promise<Set<string>> {
  const items = (await client.request(
    readItems(
      "links" as never,
      {
        fields: ["id", "url"] as never,
        limit: -1 as never,
      } as never,
    ),
  )) as DirectusItem[];
  return new Set(items.filter((i) => i.url).map((i) => i.url as string));
}

async function insertIfNew<T extends { slug?: string; url?: string }>(
  client: Client,
  collection: string,
  payload: T,
  knownSlugs: Map<string, string> | null,
  knownUrls?: Set<string>,
): Promise<{ id: string; created: boolean }> {
  if (payload.slug && knownSlugs?.has(payload.slug)) {
    return { id: knownSlugs.get(payload.slug)!, created: false };
  }
  if (payload.url && knownUrls?.has(payload.url)) {
    return { id: "", created: false };
  }
  const created = (await client.request(
    createItem(collection as never, payload as never),
  )) as DirectusItem;
  if (payload.slug) knownSlugs?.set(payload.slug, created.id);
  if (payload.url) knownUrls?.add(payload.url);
  return { id: created.id, created: true };
}

async function seedTaxonomies(client: Client) {
  // Derive terms from the stub content.
  const cuisines = new Set(stubRestaurants.map((r) => r.cuisine));
  const locations = new Set(stubRestaurants.flatMap((r) => [r.city, r.region]).filter(Boolean));
  const tags = new Set([
    ...stubRestaurants.flatMap((r) => r.tags),
    ...stubRecipes.flatMap((r) => r.tags),
  ]);
  const ingCategories = new Set(stubIngredients.map((i) => i.category));
  const eqCategories = new Set(stubEquipment.map((e) => e.category));
  const supplierTypes = new Set(stubSuppliers.map((s) => s.type));

  // Eine einzige Slug-Quelle (toTermSlug) für Seed UND E2-Migration, sonst können
  // Seed und migrate-taxonomies für denselben Namen verschiedene Slugs erzeugen
  // (die lokale Variante hier ließ den NFKD-Diakritika-Schritt aus: "Café" -> "caf-"
  // statt "cafe"). Siehe src/lib/taxonomy/slug.ts.
  async function seedTerms(collection: string, terms: Iterable<string>) {
    const existing = await existingSlugs(client, collection);
    let created = 0;
    for (const name of terms) {
      const slug = toTermSlug(name);
      if (!slug || existing.has(slug)) continue;
      await insertIfNew(client, collection, { slug, name }, existing);
      created++;
    }
    console.log(`[seed] ${collection}: +${created}`);
  }

  await seedTerms("tax_cuisines", cuisines);
  await seedTerms("tax_locations", locations);
  await seedTerms("tax_tags", tags);
  await seedTerms("tax_ingredient_categories", ingCategories);
  await seedTerms("tax_equipment_categories", eqCategories);
  await seedTerms("tax_supplier_types", supplierTypes);
}

async function seedRestaurants(client: Client): Promise<Map<string, string>> {
  const existing = await existingSlugs(client, "restaurants");
  let created = 0;
  for (const r of stubRestaurants) {
    const payload = {
      slug: r.slug,
      name: r.name,
      status: r.status,
      priority: r.priority,
      city: r.city,
      region: r.region,
      cuisine: r.cuisine,
      price_level: r.priceLevel,
      tags: r.tags,
      note: r.note,
      image: r.image,
      website: r.website ?? null,
      reservation_url: r.reservationUrl ?? null,
      maps_url: r.mapsUrl ?? null,
    };
    const result = await insertIfNew(client, "restaurants", payload, existing);
    if (result.created) created++;
  }
  console.log(`[seed] restaurants: +${created}`);
  return existing;
}

async function seedReviews(client: Client, restaurantIds: Map<string, string>) {
  const existing = await existingSlugs(client, "restaurant_reviews");
  let created = 0;
  for (const rv of stubReviews) {
    const restaurantId = restaurantIds.get(rv.restaurantSlug);
    if (!restaurantId) {
      console.warn(`[seed] review ${rv.slug}: restaurant ${rv.restaurantSlug} not found, skipping`);
      continue;
    }
    const payload = {
      slug: rv.slug,
      title: rv.title,
      // Echten Stub-Status übernehmen (wie seedArticles), statt hart "published":
      // sonst würde ein Entwurfs-Review beim Seed stillschweigend veröffentlicht (SEC-1).
      status: rv.status,
      restaurant: restaurantId,
      visited_on: rv.visitedOn,
      rating: rv.rating,
      excerpt: rv.excerpt,
      body: rv.body,
      image: rv.image,
      gallery_images: rv.galleryImages,
    };
    const result = await insertIfNew(client, "restaurant_reviews", payload, existing);
    if (result.created) created++;
  }
  console.log(`[seed] restaurant_reviews: +${created}`);
}

async function seedArticles(client: Client) {
  const existing = await existingSlugs(client, "articles");
  let created = 0;
  for (const a of stubArticles) {
    const payload = {
      slug: a.slug,
      title: a.title,
      status: a.status,
      published_date: a.publishedDate,
      eyebrow: a.eyebrow ?? null,
      summary: a.summary,
      body: a.body,
      image: a.image,
      gallery_images: a.galleryImages,
      tags: a.tags,
      related_restaurant_slugs: a.relatedRestaurantSlugs,
      related_recipe_slugs: a.relatedRecipeSlugs,
      related_cocktail_slugs: a.relatedCocktailSlugs,
      seo_title: a.seoTitle ?? null,
      seo_description: a.seoDescription ?? null,
    };
    const result = await insertIfNew(client, "articles", payload, existing);
    if (result.created) created++;
  }
  console.log(`[seed] articles: +${created}`);
}

async function seedSuppliers(client: Client) {
  const existing = await existingSlugs(client, "suppliers");
  let created = 0;
  for (const s of stubSuppliers) {
    const payload = {
      slug: s.slug,
      name: s.name,
      type: s.type,
      city: s.city,
      website: s.website ?? null,
      note: s.note,
    };
    const result = await insertIfNew(client, "suppliers", payload, existing);
    if (result.created) created++;
  }
  console.log(`[seed] suppliers: +${created}`);
}

async function seedIngredients(client: Client) {
  const existing = await existingSlugs(client, "ingredients");
  let created = 0;
  for (const i of stubIngredients) {
    const payload = {
      slug: i.slug,
      name: i.name,
      category: i.category,
      image: i.image,
      note: i.note,
      supplier_slugs: i.supplierSlugs,
    };
    const result = await insertIfNew(client, "ingredients", payload, existing);
    if (result.created) created++;
  }
  console.log(`[seed] ingredients: +${created}`);
}

async function seedEquipment(client: Client) {
  const existing = await existingSlugs(client, "equipment");
  let created = 0;
  for (const e of stubEquipment) {
    const payload = {
      slug: e.slug,
      name: e.name,
      status: e.status,
      category: e.category,
      manufacturer: e.manufacturer ?? null,
      model: e.model ?? null,
      product_url: e.productUrl ?? null,
      image: e.image,
      note: e.note,
      linked_recipe_slugs: e.linkedRecipes,
      linked_cocktail_slugs: e.linkedCocktails,
    };
    const result = await insertIfNew(client, "equipment", payload, existing);
    if (result.created) created++;
  }
  console.log(`[seed] equipment: +${created}`);
}

async function seedRecipes(client: Client) {
  const existing = await existingSlugs(client, "recipes");
  let created = 0;
  for (const r of stubRecipes) {
    const payload = {
      slug: r.slug,
      title: r.title,
      image: r.image,
      summary: r.summary,
      servings: r.servings,
      prep_min: r.prepMin,
      cook_min: r.cookMin,
      difficulty: r.difficulty,
      tags: r.tags,
      ingredients: r.ingredients.map((ing) => ({
        amount: ing.amount,
        item: ing.item,
        ingredient_slug: ing.ingredientSlug ?? null,
      })),
      steps: r.steps,
      equipment_slugs: r.equipmentSlugs,
      notes: r.notes ?? null,
    };
    const result = await insertIfNew(client, "recipes", payload, existing);
    if (result.created) created++;
  }
  console.log(`[seed] recipes: +${created}`);
}

async function seedCocktails(client: Client) {
  const existing = await existingSlugs(client, "cocktails");
  let created = 0;
  for (const c of stubCocktails) {
    const payload = {
      slug: c.slug,
      name: c.name,
      type: c.type,
      glass: c.glass,
      ice: c.ice,
      technique: c.technique,
      flavor_profile: c.flavorProfile,
      image: c.image,
      pours: c.pours.map((p) => ({
        amount: p.amount,
        item: p.item,
        ingredient_slug: p.ingredientSlug ?? null,
      })),
      garnish: c.garnish,
      preparation: c.preparation,
      variants: c.variants ?? [],
    };
    const result = await insertIfNew(client, "cocktails", payload, existing);
    if (result.created) created++;
  }
  console.log(`[seed] cocktails: +${created}`);
}

async function seedCollections(client: Client) {
  const existing = await existingSlugs(client, "content_collections");
  let created = 0;
  for (const c of stubCollections) {
    const payload = {
      slug: c.slug,
      title: c.title,
      type: c.type,
      image: c.image,
      description: c.description,
      restaurant_slugs: c.restaurantSlugs,
      recipe_slugs: c.recipeSlugs,
      cocktail_slugs: c.cocktailSlugs,
      equipment_slugs: c.equipmentSlugs,
    };
    const result = await insertIfNew(client, "content_collections", payload, existing);
    if (result.created) created++;
  }
  console.log(`[seed] content_collections: +${created}`);
}

async function seedLinks(client: Client) {
  const knownUrls = await existingLinkUrls(client);
  let created = 0;
  for (const l of stubLinks) {
    if (knownUrls.has(l.url)) continue;
    const payload = {
      url: l.url,
      label: l.label,
      source: l.source,
      restaurant_slug: l.restaurantSlug ?? null,
      recipe_slug: l.recipeSlug ?? null,
      cocktail_slug: l.cocktailSlug ?? null,
      equipment_slug: l.equipmentSlug ?? null,
    };
    await client.request(createItem("links" as never, payload as never));
    knownUrls.add(l.url);
    created++;
  }
  console.log(`[seed] links: +${created}`);
}

async function main() {
  console.log("[seed] connecting to Directus…");
  const client = await authenticatedClient();
  console.log("[seed] authenticated.");

  await seedTaxonomies(client);
  const restaurantIds = await seedRestaurants(client);
  await seedReviews(client, restaurantIds);
  await seedArticles(client);
  await seedSuppliers(client);
  await seedIngredients(client);
  await seedEquipment(client);
  await seedRecipes(client);
  await seedCocktails(client);
  await seedCollections(client);
  await seedLinks(client);

  console.log("[seed] done.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[seed] failed:", error);
    process.exit(1);
  });
