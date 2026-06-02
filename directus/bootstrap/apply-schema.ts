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
import {
  ensureCollection,
  ensureField,
  ensureRelation,
  snapshot,
  type CollectionDef,
} from "./schema-helpers.js";

import { taxonomyCollections } from "./schema/taxonomies.js";
import {
  restaurantCollection,
  reviewCollection,
  restaurantRelations,
} from "./schema/restaurants.js";
import { articleCollection } from "./schema/articles.js";
import { imageFileField, mediaCollections, fileRelations } from "./schema/media.js";
import { galleryJunctionCollection, galleryField, galleryRelations } from "./schema/gallery.js";
import { ingredientCollection, supplierCollection } from "./schema/ingredients.js";
import { equipmentCollection } from "./schema/equipment.js";
import { recipeCollection } from "./schema/recipes.js";
import { cocktailCollection } from "./schema/cocktails.js";
import { collectionCollection } from "./schema/collections.js";
import { linkCollection } from "./schema/links.js";

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
    // Phase 4: m2m-Junction für die Artikel-Galerie (Ziel-Collections articles +
    // directus_files existieren bereits; Relationen werden unten ergänzt).
    galleryJunctionCollection,
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

  // E1.3: additive image_file field + relation to directus_files on the
  // visual collections. Idempotent — ensureField/ensureRelation skip existing.
  for (const collection of mediaCollections) {
    await ensureField(client, collection, imageFileField, existing.fields);
  }
  for (const relation of fileRelations) {
    await ensureRelation(client, relation);
  }

  // Phase 4: Galerie-m2m – Alias-Feld auf articles + die zwei Junction-Relationen.
  await ensureField(client, "articles", galleryField, existing.fields);
  for (const relation of galleryRelations) {
    await ensureRelation(client, relation);
  }

  // Relations — idempotent via ensureRelation (erkennt auch Directus'
  // „already has an associated relationship" für bereits bestehende Relationen).
  for (const relation of restaurantRelations) {
    await ensureRelation(client, relation);
  }

  console.log("[schema] done.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[schema] failed:", error);
    process.exit(1);
  });
