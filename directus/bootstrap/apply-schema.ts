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
import { ensureCollection, ensureField, snapshot, type CollectionDef } from "./schema-helpers.js";

import { taxonomyCollections } from "./schema/taxonomies.js";
import {
  restaurantCollection,
  reviewCollection,
  restaurantRelations,
} from "./schema/restaurants.js";
import { articleCollection } from "./schema/articles.js";
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
    articleCollection,
    supplierCollection,
    ingredientCollection,
    equipmentCollection,
    recipeCollection,
    cocktailCollection,
    collectionCollection,
    linkCollection,
  ];

  for (const def of allCollections) {
    const created = await ensureCollection(client, def, existing.collections);
    if (created) {
      // Fields were created together with the collection; record them so the
      // reconciliation below does not try to create them a second time.
      for (const f of def.fields) {
        existing.fields.add(`${def.collection}.${f.field}`);
      }
    } else {
      // Collection already existed: additively reconcile any missing fields.
      // This makes `schema:apply` an idempotent forward migration for new
      // fields (NOT for type changes or renames — those still need a reset
      // or a manual migration). Closes the gap where new fields added to a
      // schema/*.ts file were silently ignored against an existing DB.
      for (const f of def.fields) {
        await ensureField(client, def.collection, f, existing.fields);
      }
    }
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
