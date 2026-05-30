/**
 * purge-seed.ts - entfernt GENAU die Seed-Beispieldaten wieder, fuer einen
 * sauberen Start mit echten Inhalten.
 *
 * Sicherheit:
 *  - Loescht NUR Eintraege, deren Slug/URL aus src/data/stub.ts stammt (also
 *    exakt das, was `seed` angelegt haette). Eigene Inhalte mit anderen Slugs
 *    bleiben unberuehrt.
 *  - Reihenfolge beachtet die FK restaurant_reviews -> restaurants
 *    (ON DELETE NO ACTION): erst Kritiken, dann Restaurants.
 *  - Fehler pro Collection werden geloggt und uebersprungen (z. B. wenn ein
 *    eigenes, echtes Review noch auf ein Seed-Restaurant zeigt -> dann bleibt
 *    das Restaurant stehen, schuetzt deinen Inhalt).
 *  - Taxonomie-Terme bleiben (unsichtbare Struktur). Idempotent.
 *
 * VORHER: pg_dump-Backup (siehe DEPLOY_STATE §7). Danach `seed` NICHT mehr
 * ausfuehren, sonst kommen die Dummies zurueck.
 *
 * Usage:  pnpm purge:seed
 */
import { deleteItems, readItems } from "@directus/sdk";
import { authenticatedClient, type Client } from "./client.js";

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

function extractMessage(error: unknown): string {
  const e = error as { message?: string; errors?: Array<{ message?: string }> };
  if (e?.errors?.length) return e.errors.map((x) => x?.message ?? "").join("; ");
  return e?.message ?? String(error);
}

/** Loescht aus `collection` alle Items, deren `field`-Wert in `values` liegt. */
async function purge(client: Client, collection: string, field: string, values: string[]) {
  if (values.length === 0) {
    console.log(`[purge] ${collection}: 0 (nichts zu loeschen)`);
    return;
  }
  const items = (await client.request(
    readItems(
      collection as never,
      {
        fields: ["id"] as never,
        filter: { [field]: { _in: values } } as never,
        limit: -1 as never,
      } as never,
    ),
  )) as Array<{ id: string }>;

  if (items.length === 0) {
    console.log(`[purge] ${collection}: 0`);
    return;
  }
  try {
    await client.request(deleteItems(collection as never, items.map((i) => i.id) as never));
    console.log(`[purge] ${collection}: -${items.length}`);
  } catch (error) {
    console.warn(`[purge] ${collection}: uebersprungen (${extractMessage(error)})`);
  }
}

async function main() {
  console.log("[purge] connecting to Directus...");
  const client = await authenticatedClient();
  console.log("[purge] authenticated.");

  // FK-Reihenfolge: Kritiken vor Restaurants.
  await purge(
    client,
    "restaurant_reviews",
    "slug",
    stubReviews.map((r) => r.slug),
  );
  await purge(
    client,
    "restaurants",
    "slug",
    stubRestaurants.map((r) => r.slug),
  );
  await purge(
    client,
    "articles",
    "slug",
    stubArticles.map((a) => a.slug),
  );
  await purge(
    client,
    "recipes",
    "slug",
    stubRecipes.map((r) => r.slug),
  );
  await purge(
    client,
    "cocktails",
    "slug",
    stubCocktails.map((c) => c.slug),
  );
  await purge(
    client,
    "ingredients",
    "slug",
    stubIngredients.map((i) => i.slug),
  );
  await purge(
    client,
    "suppliers",
    "slug",
    stubSuppliers.map((s) => s.slug),
  );
  await purge(
    client,
    "equipment",
    "slug",
    stubEquipment.map((e) => e.slug),
  );
  await purge(
    client,
    "content_collections",
    "slug",
    stubCollections.map((c) => c.slug),
  );
  await purge(
    client,
    "links",
    "url",
    stubLinks.map((l) => l.url),
  );

  console.log("[purge] done. Taxonomie-Terme bleiben als Struktur erhalten.");
  console.log(
    "[purge] WICHTIG: `seed` jetzt NICHT mehr ausfuehren (sonst kommen die Dummies zurueck).",
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[purge] failed:", error);
    process.exit(1);
  });
