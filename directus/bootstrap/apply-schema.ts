/**
 * Applies the joes-journal domain schema (collections, fields, relations) to a
 * running Directus instance via the SDK.
 *
 * Usage:
 *   pnpm schema:apply
 *
 * Prereqs:
 *   - Directus is running (`pnpm start` in another shell)
 *   - DB has been initialized (`pnpm bootstrap`)
 *   - .env contains ADMIN_EMAIL / ADMIN_PASSWORD
 */
import { authenticatedClient } from "./client.js";
import { ensureCollection, snapshot, type CollectionDef } from "./schema-helpers.js";

import { taxonomyCollections } from "./schema/taxonomies.js";
import {
  restaurantCollection,
  reviewCollection,
  restaurantRelations,
} from "./schema/restaurants.js";
import { ingredientCollection, supplierCollection } from "./schema/ingredients.js";
import { equipmentCollection } from "./schema/equipment.js";
import { recipeCollection } from "./schema/recipes.js";
import { cocktailCollection } from "./schema/cocktails.js";
import { collectionCollection } from "./schema/collections.js";
import { linkCollection } from "./schema/links.js";

import { createRelation } from "@directus/sdk";

async function main() {
  console.log("[schema] connecting to Directus…");
  const client = await authenticatedClient();
  console.log("[schema] authenticated.");

  const existing = await snapshot(client);

  // Order matters only for relations (target collections must exist first).
  const allCollections: CollectionDef[] = [
    ...taxonomyCollections,
    restaurantCollection,
    reviewCollection,
    supplierCollection,
    ingredientCollection,
    equipmentCollection,
    recipeCollection,
    cocktailCollection,
    collectionCollection,
    linkCollection,
  ];

  for (const def of allCollections) {
    await ensureCollection(client, def, existing.collections);
  }

  // Relations
  for (const relation of restaurantRelations) {
    try {
      await client.request(
        createRelation({
          collection: relation.collection,
          field: relation.field,
          related_collection: relation.related_collection,
          meta: relation.meta,
          schema: relation.schema,
        } as never),
      );
      console.log(
        `[schema] relation created: ${relation.collection}.${relation.field} → ${relation.related_collection}`,
      );
    } catch (error) {
      const message = (error as { message?: string }).message ?? String(error);
      if (message.includes("already exists") || message.includes("duplicate")) {
        console.log(`[schema] relation already exists: ${relation.collection}.${relation.field}`);
        continue;
      }
      throw error;
    }
  }

  console.log("[schema] done.");
}

main().catch((error) => {
  console.error("[schema] failed:", error);
  process.exit(1);
});
