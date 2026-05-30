/**
 * E1.4 - Gespeicherte Filter / Bookmarks fuer den Redaktionsmodus.
 *
 * Legt globale Presets (directus_presets mit bookmark-Name, user=null) an, die
 * in der Directus-Sidebar als schnelle Sichten erscheinen: Entwuerfe,
 * Veroeffentlicht, Hohe Prioritaet, Ohne Bild, je Stadt usw.
 *
 * Idempotent: vorhandene Bookmarks (collection + bookmark-Name) werden
 * uebersprungen. Rein additiv - veraendert keine bestehenden Daten.
 *
 * Usage:  pnpm presets:apply   (Directus muss laufen, .env mit ADMIN_*)
 */
import { createPreset, readPresets } from "@directus/sdk";
import { authenticatedClient, type Client } from "./client.js";

interface PresetDef {
  collection: string;
  bookmark: string;
  icon?: string;
  layout?: string;
  filter?: Record<string, unknown> | null;
  search?: string | null;
}

const PRESETS: PresetDef[] = [
  // Kritiken
  {
    collection: "restaurant_reviews",
    bookmark: "Entwuerfe",
    icon: "edit_note",
    filter: { status: { _eq: "draft" } },
  },
  {
    collection: "restaurant_reviews",
    bookmark: "Veroeffentlicht",
    icon: "public",
    filter: { status: { _eq: "published" } },
  },
  // Journal-Artikel
  {
    collection: "articles",
    bookmark: "Entwuerfe",
    icon: "edit_note",
    filter: { status: { _eq: "draft" } },
  },
  {
    collection: "articles",
    bookmark: "Veroeffentlicht",
    icon: "public",
    filter: { status: { _eq: "published" } },
  },
  // Restaurants
  {
    collection: "restaurants",
    bookmark: "Hohe Prioritaet",
    icon: "priority_high",
    filter: { priority: { _eq: "hoch" } },
  },
  {
    collection: "restaurants",
    bookmark: "Ohne Bild",
    icon: "hide_image",
    filter: { _and: [{ image: { _empty: true } }, { image_file: { _null: true } }] },
  },
  {
    collection: "restaurants",
    bookmark: "Watchlist",
    icon: "bookmark",
    filter: { status: { _in: ["wishlist", "planned"] } },
  },
  {
    collection: "restaurants",
    bookmark: "Berlin",
    icon: "place",
    filter: { city: { _eq: "Berlin" } },
  },
  // Geraete
  {
    collection: "equipment",
    bookmark: "Wunschliste",
    icon: "shopping_cart",
    filter: { status: { _eq: "wishlist" } },
  },
];

async function existingBookmarks(client: Client): Promise<Set<string>> {
  const presets = (await client.request(
    readPresets({
      fields: ["collection", "bookmark"] as never,
      limit: -1 as never,
    } as never),
  )) as Array<{ collection: string; bookmark: string | null }>;
  return new Set(presets.filter((p) => p.bookmark).map((p) => `${p.collection}|${p.bookmark}`));
}

async function main() {
  console.log("[presets] connecting to Directus...");
  const client = await authenticatedClient();
  console.log("[presets] authenticated.");

  const existing = await existingBookmarks(client);
  let created = 0;
  for (const p of PRESETS) {
    const key = `${p.collection}|${p.bookmark}`;
    if (existing.has(key)) {
      console.log(`[presets] exists: ${key}`);
      continue;
    }
    await client.request(
      createPreset({
        collection: p.collection,
        bookmark: p.bookmark,
        user: null,
        role: null,
        layout: p.layout ?? "tabular",
        icon: p.icon ?? "bookmark",
        filter: p.filter ?? null,
        search: p.search ?? null,
      } as never),
    );
    existing.add(key);
    created++;
    console.log(`[presets] created: ${key}`);
  }

  console.log(`[presets] done. +${created} Bookmark(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[presets] failed:", error);
    process.exit(1);
  });
