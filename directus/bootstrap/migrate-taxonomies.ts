/**
 * E2 - Migriert die Freitext-Felder von `restaurants` in die relationalen
 * Taxonomie-Verknüpfungen (cuisines M2M, tags M2M, location M2O).
 *
 * Voraussetzung: `pnpm relations:apply` lief (Strukturen existieren).
 * VORHER: pg_dump-Backup + Restore-Drill (MIGRATION_E2.md §2/§3).
 *
 * Idempotent:
 *  - Terme werden nur angelegt, wenn ihr Slug noch fehlt.
 *  - Junction-Zeilen werden nur angelegt, wenn (restaurant, term) noch fehlt.
 *  - location_term wird nur gesetzt, wenn es noch leer ist (keine Überschreibung
 *    manueller Pflege).
 * Bestehende Freitext-Spalten (cuisine, tags, city, region) bleiben unangetastet
 * als Fallback, bis der Frontend-Cutover (E2.5) erfolgt ist.
 *
 * Usage:  pnpm migrate:taxonomies
 */
import { createItem, readItems, updateItem } from "@directus/sdk";
import { authenticatedClient, type Client } from "./client.js";
import { splitTerms, toTermSlug } from "../../src/lib/taxonomy/slug.ts";

interface RestaurantRow {
  id: string;
  slug: string;
  cuisine: string | null;
  tags: string[] | null;
  city: string | null;
  region: string | null;
  location_term: string | null;
}

async function readAll<T>(client: Client, collection: string, fields: string[]): Promise<T[]> {
  return (await client.request(
    readItems(collection as never, { limit: -1 as never, fields: fields as never } as never),
  )) as T[];
}

/**
 * Liefert einen Term-Resolver für eine Taxonomie. Matcht primär per **Name**
 * (exakt, wie geseedet), zusätzlich per Slug (gegen abweichende Slug-Schemata).
 * Nur wenn beides fehlt, wird der Term mit `slug = toTermSlug(name)` angelegt.
 * So entstehen keine Duplikate, egal welches Slug-Schema bestehende Terme haben.
 */
async function termResolver(client: Client, collection: string) {
  const terms = await readAll<{ id: string; slug: string; name: string }>(client, collection, [
    "id",
    "slug",
    "name",
  ]);
  const byName = new Map(terms.map((t) => [t.name, t.id]));
  const bySlug = new Map(terms.map((t) => [t.slug, t.id]));

  return async function ensureTerm(name: string): Promise<string> {
    const slug = toTermSlug(name);
    const existing = byName.get(name) ?? bySlug.get(slug);
    if (existing) return existing;
    const created = (await client.request(
      createItem(collection as never, { slug, name } as never),
    )) as { id: string };
    byName.set(name, created.id);
    bySlug.set(slug, created.id);
    console.log(`[migrate] ${collection}: + term "${name}" (${slug})`);
    return created.id;
  };
}

/** Idempotenter M2M-Linker über eine Junction-Collection. */
async function junctionLinker(client: Client, junction: string, termField: string) {
  const rows = await readAll<Record<string, string>>(client, junction, [
    "restaurants_id",
    termField,
  ]);
  const seen = new Set(rows.map((r) => `${r.restaurants_id}|${r[termField]}`));

  return async function link(restaurantId: string, termId: string): Promise<boolean> {
    const key = `${restaurantId}|${termId}`;
    if (seen.has(key)) return false;
    await client.request(
      createItem(junction as never, { restaurants_id: restaurantId, [termField]: termId } as never),
    );
    seen.add(key);
    return true;
  };
}

async function main() {
  console.log("[migrate] connecting to Directus...");
  const client = await authenticatedClient();
  console.log("[migrate] authenticated.");

  const restaurants = await readAll<RestaurantRow>(client, "restaurants", [
    "id",
    "slug",
    "cuisine",
    "tags",
    "city",
    "region",
    "location_term",
  ]);
  console.log(`[migrate] ${restaurants.length} Restaurants gelesen.`);

  const ensureCuisine = await termResolver(client, "tax_cuisines");
  const ensureTag = await termResolver(client, "tax_tags");
  const ensureLocation = await termResolver(client, "tax_locations");
  const linkCuisine = await junctionLinker(client, "restaurants_cuisines", "tax_cuisines_id");
  const linkTag = await junctionLinker(client, "restaurants_tags", "tax_tags_id");

  let cuisineLinks = 0;
  let tagLinks = 0;
  let locationsSet = 0;

  for (const r of restaurants) {
    for (const term of splitTerms(r.cuisine ?? "")) {
      if (await linkCuisine(r.id, await ensureCuisine(term))) cuisineLinks++;
    }
    for (const tag of r.tags ?? []) {
      if (await linkTag(r.id, await ensureTag(tag))) tagLinks++;
    }
    // location_term aus der Stadt (spezifischster Ort); Region bleibt vorerst String.
    if (!r.location_term && r.city) {
      const locId = await ensureLocation(r.city);
      await client.request(
        updateItem("restaurants" as never, r.id as never, { location_term: locId } as never),
      );
      locationsSet++;
    }
  }

  console.log(
    `[migrate] done. +${cuisineLinks} Küchen-Links, +${tagLinks} Tag-Links, ` +
      `+${locationsSet} location_term gesetzt.`,
  );
  console.log("[migrate] Verifikation: Counts in Directus prüfen (MIGRATION_E2.md §4).");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[migrate] failed:", error);
    process.exit(1);
  });
