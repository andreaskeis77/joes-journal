/**
 * E2 - Legt die additiven Taxonomie-Relationen an (siehe taxonomy-relations.ts).
 *
 * BEWUSST GETRENNT von `schema:apply`: M2M-Junctions sind komplexer/riskanter
 * als einfache Feld-Adds; diese Trennung verhindert, dass ein Fehler hier die
 * routinemäßige (additive) Schema-Pflege blockiert.
 *
 * Rein additiv (neue Collections/Felder/Relationen) - verändert keine
 * bestehenden Spalten. Trotzdem: ERST auf einer Restore-Drill-Kopie ausführen
 * (MIGRATION_E2.md §3), dann live.
 *
 * Usage:  pnpm relations:apply
 */
import { authenticatedClient } from "./client.js";
import { ensureCollection, ensureField, ensureRelation, snapshot } from "./schema-helpers.js";
import {
  junctionCollections,
  restaurantAliasFields,
  locationField,
  taxonomyRelations,
} from "./schema/taxonomy-relations.js";

async function main() {
  console.log("[relations] connecting to Directus...");
  const client = await authenticatedClient();
  console.log("[relations] authenticated.");

  const existing = await snapshot(client);

  // 1) Junction-Collections (mit ihren beiden m2o-Feldern).
  for (const def of junctionCollections) {
    const created = await ensureCollection(client, def, existing.collections);
    if (created) {
      for (const f of def.fields) existing.fields.add(`${def.collection}.${f.field}`);
    } else {
      for (const f of def.fields) await ensureField(client, def.collection, f, existing.fields);
    }
  }

  // 2) Alias-Felder + M2O-Feld auf restaurants.
  for (const f of restaurantAliasFields) {
    await ensureField(client, "restaurants", f, existing.fields);
  }
  await ensureField(client, "restaurants", locationField, existing.fields);

  // 3) Relationen.
  for (const relation of taxonomyRelations) {
    await ensureRelation(client, relation);
  }

  console.log("[relations] done. Strukturen angelegt - jetzt migrieren (pnpm migrate:taxonomies).");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[relations] failed:", error);
    process.exit(1);
  });
