/**
 * Phase 3 - Deutsche Feld-UX der Articles-Collection (Journal).
 *
 * Setzt rein additiv/idempotent: deutsche Feld-Labels (meta.translations de-DE),
 * Feldgruppen (Inhalt / Bilder / SEO / Verknuepfungen), das Titelbild-Relabel
 * (image_file -> "Titelbild") und versteckt die Legacy-Fallback-Felder
 * (image, gallery_images). Aendert KEINE Daten und KEINE Feldtypen.
 *
 * Reihenfolge: NACH `pnpm schema:apply` ausfuehren, damit `gallery_files`
 * (Phase 4) bereits existiert und einer Gruppe zugeordnet werden kann. Fehlende
 * Felder werden uebersprungen, nicht angelegt.
 *
 * Usage:  pnpm fields:refine   (Directus laeuft, .env mit ADMIN_*)
 */
import { createField, readFields, updateField } from "@directus/sdk";
import { authenticatedClient, type Client } from "./client.js";

const COLLECTION = "articles";

/** de-DE-Uebersetzung im Directus-Meta-Format. */
function de(translation: string) {
  return [{ language: "de-DE", translation }];
}

interface GroupDef {
  field: string;
  label: string;
  sort: number;
  open?: boolean;
}
const GROUPS: GroupDef[] = [
  { field: "group_inhalt", label: "Inhalt", sort: 1, open: true },
  { field: "group_bilder", label: "Bilder", sort: 2, open: true },
  { field: "group_seo", label: "SEO", sort: 3 },
  { field: "group_verknuepfungen", label: "Verknuepfungen", sort: 4 },
];

interface FieldCfg {
  group: string;
  label?: string;
  note?: string;
  hidden?: boolean;
  sort?: number;
}
const FIELDS: Record<string, FieldCfg> = {
  eyebrow: { group: "group_inhalt", label: "Kicker (Eyebrow)", sort: 1 },
  title: { group: "group_inhalt", label: "Titel", sort: 2 },
  slug: { group: "group_inhalt", label: "URL-Kuerzel (Slug)", sort: 3 },
  status: { group: "group_inhalt", label: "Status", sort: 4 },
  published_date: { group: "group_inhalt", label: "Veroeffentlicht am", sort: 5 },
  summary: { group: "group_inhalt", label: "Zusammenfassung", sort: 6 },
  body: { group: "group_inhalt", label: "Beitragstext", sort: 7 },
  image_file: {
    group: "group_bilder",
    label: "Titelbild",
    note: "Grosses Bild oben auf der Seite. Hierhin hochladen.",
    sort: 1,
  },
  gallery_files: { group: "group_bilder", label: "Galerie", note: "Mehrere Bilder.", sort: 2 },
  image: { group: "group_bilder", label: "Titelbild-Pfad (Fallback)", hidden: true, sort: 3 },
  gallery_images: { group: "group_bilder", label: "Galerie-Pfade (Fallback)", hidden: true, sort: 4 },
  seo_title: { group: "group_seo", label: "SEO-Titel", sort: 1 },
  seo_description: { group: "group_seo", label: "SEO-Beschreibung", sort: 2 },
  tags: { group: "group_verknuepfungen", label: "Tags", sort: 1 },
  related_restaurant_slugs: {
    group: "group_verknuepfungen",
    label: "Verknuepfte Restaurants",
    sort: 2,
  },
  related_recipe_slugs: { group: "group_verknuepfungen", label: "Verknuepfte Rezepte", sort: 3 },
  related_cocktail_slugs: { group: "group_verknuepfungen", label: "Verknuepfte Cocktails", sort: 4 },
};

/** Aktuelle Feld-Meta je Articles-Feld (fuer sicheres read-then-merge). */
async function articleFieldMeta(client: Client): Promise<Map<string, Record<string, unknown>>> {
  const fields = (await client.request(readFields())) as Array<{
    collection: string;
    field: string;
    meta?: Record<string, unknown> | null;
  }>;
  return new Map(
    fields.filter((f) => f.collection === COLLECTION).map((f) => [f.field, f.meta ?? {}]),
  );
}

async function main() {
  console.log("[fields] connecting to Directus...");
  const client = await authenticatedClient();
  console.log("[fields] authenticated.");

  const existing = await articleFieldMeta(client);

  // 1) Gruppen-Container (alias/group-detail) anlegen, falls noch nicht da.
  for (const g of GROUPS) {
    if (existing.has(g.field)) {
      console.log(`[fields] group exists: ${g.field}`);
      continue;
    }
    await client.request(
      createField(COLLECTION, {
        field: g.field,
        type: "alias",
        meta: {
          interface: "group-detail",
          special: ["alias", "no-data", "group"],
          options: { start: g.open ? "open" : "closed" },
          translations: de(g.label),
          sort: g.sort,
          width: "full",
        },
        schema: null,
      } as never),
    );
    existing.set(g.field, {});
    console.log(`[fields] created group: ${g.field}`);
  }

  // 2) Felder den Gruppen zuordnen + deutsche Labels/Notizen/Sichtbarkeit.
  //    read-then-merge: bestehende Meta (interface/special/options) bleibt erhalten.
  for (const [field, cfg] of Object.entries(FIELDS)) {
    const current = existing.get(field);
    if (!current) {
      console.warn(`[fields] skip (Feld fehlt): ${field}`);
      continue;
    }
    const meta: Record<string, unknown> = { ...current, group: cfg.group };
    if (cfg.label) meta.translations = de(cfg.label);
    if (cfg.note !== undefined) meta.note = cfg.note;
    if (cfg.hidden !== undefined) meta.hidden = cfg.hidden;
    if (cfg.sort !== undefined) meta.sort = cfg.sort;
    try {
      await client.request(updateField(COLLECTION, field, { meta } as never));
      console.log(`[fields] updated: ${field}`);
    } catch (error) {
      const m = (error as { message?: string }).message ?? String(error);
      console.warn(`[fields] ${field}: uebersprungen (${m})`);
    }
  }

  console.log("[fields] done.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[fields] failed:", error);
    process.exit(1);
  });
