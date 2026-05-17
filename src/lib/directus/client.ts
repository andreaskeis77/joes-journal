/**
 * Read-only Directus client used at build time by the Astro frontend.
 *
 * The client is constructed lazily so that the Astro build does not try to
 * authenticate when JOES_DATA_SOURCE is set to "stub" (the default).
 */
import { authentication, createDirectus, readItems, rest } from "@directus/sdk";
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

interface JoesSchema {
  restaurants: DirectusRestaurant[];
  restaurant_reviews: DirectusReview[];
  recipes: DirectusRecipe[];
  cocktails: DirectusCocktail[];
  equipment: DirectusEquipment[];
  ingredients: DirectusIngredient[];
  suppliers: DirectusSupplier[];
  content_collections: DirectusContentCollection[];
  links: DirectusLink[];
}

export interface DirectusConfig {
  url: string;
  email: string;
  password: string;
}

export function readConfig(env: Record<string, string | undefined> = import.meta.env as never): DirectusConfig {
  const url = env.JOES_DIRECTUS_URL ?? "http://127.0.0.1:8055";
  const email = env.JOES_DIRECTUS_EMAIL ?? "";
  const password = env.JOES_DIRECTUS_PASSWORD ?? "";
  if (!email || !password) {
    throw new Error(
      "JOES_DIRECTUS_EMAIL and JOES_DIRECTUS_PASSWORD must be set when JOES_DATA_SOURCE=directus.",
    );
  }
  return { url, email, password };
}

async function withRetry<T>(label: string, fn: () => Promise<T>, attempts = 3, delayMs = 500): Promise<T> {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const cause = (error as { cause?: { code?: string } }).cause;
      const retryable = cause?.code === "ETIMEDOUT" || cause?.code === "ECONNREFUSED" || cause?.code === "ECONNRESET";
      if (!retryable || i === attempts) {
        throw error;
      }
      console.warn(`[joes-journal] ${label} attempt ${i} failed (${cause?.code}); retrying…`);
      await new Promise((r) => setTimeout(r, delayMs * i));
    }
  }
  throw lastError;
}

export async function createAuthenticatedClient(config: DirectusConfig = readConfig()) {
  const client = createDirectus<JoesSchema>(config.url).with(authentication()).with(rest());
  await withRetry("login", () => client.login(config.email, config.password));
  return client;
}

export type JoesDirectusClient = Awaited<ReturnType<typeof createAuthenticatedClient>>;

export interface RawData {
  restaurants: DirectusRestaurant[];
  reviews: DirectusReview[];
  recipes: DirectusRecipe[];
  cocktails: DirectusCocktail[];
  equipment: DirectusEquipment[];
  ingredients: DirectusIngredient[];
  suppliers: DirectusSupplier[];
  collections: DirectusContentCollection[];
  links: DirectusLink[];
}

/**
 * Pulls every domain collection in parallel.
 *
 * `restaurants` requests the inverse `reviews` relation so we can derive
 * `restaurant.reviewSlug` without a second round trip.
 */
export async function fetchAllRaw(client: JoesDirectusClient): Promise<RawData> {
  const [
    restaurants,
    reviews,
    recipes,
    cocktails,
    equipmentItems,
    ingredients,
    suppliers,
    collections,
    links,
  ] = await Promise.all([
    client.request(
      readItems("restaurants", { limit: -1, fields: ["*"] as never } as never),
    ) as Promise<DirectusRestaurant[]>,
    client.request(
      readItems("restaurant_reviews", {
        limit: -1,
        fields: ["*", { restaurant: ["slug"] }] as never,
        sort: ["-visited_on"] as never,
      } as never),
    ) as Promise<DirectusReview[]>,
    client.request(
      readItems("recipes", { limit: -1, fields: ["*"] as never } as never),
    ) as Promise<DirectusRecipe[]>,
    client.request(
      readItems("cocktails", { limit: -1, fields: ["*"] as never } as never),
    ) as Promise<DirectusCocktail[]>,
    client.request(
      readItems("equipment", { limit: -1, fields: ["*"] as never } as never),
    ) as Promise<DirectusEquipment[]>,
    client.request(
      readItems("ingredients", { limit: -1, fields: ["*"] as never } as never),
    ) as Promise<DirectusIngredient[]>,
    client.request(
      readItems("suppliers", { limit: -1, fields: ["*"] as never } as never),
    ) as Promise<DirectusSupplier[]>,
    client.request(
      readItems("content_collections", { limit: -1, fields: ["*"] as never } as never),
    ) as Promise<DirectusContentCollection[]>,
    client.request(
      readItems("links", { limit: -1, fields: ["*"] as never } as never),
    ) as Promise<DirectusLink[]>,
  ]);

  return {
    restaurants,
    reviews,
    recipes,
    cocktails,
    equipment: equipmentItems,
    ingredients,
    suppliers,
    collections,
    links,
  };
}
