/**
 * Deutsche Feld-UX (Labels, Feldgruppen, Titelbild-Relabel, versteckte
 * Fallback-Felder) – jetzt DATENGETRIEBEN über mehrere Collections statt nur
 * `articles`. Setzt rein additiv/idempotent: deutsche Feld-Labels
 * (meta.translations de-DE), Feldgruppen (alias/group-detail), Titelbild-Relabel
 * (image_file -> "Titelbild") und versteckt die Legacy-Fallback-Felder
 * (image, gallery_images). Ändert KEINE Daten und KEINE Feldtypen.
 *
 * Hintergrund: Bisher war nur das Journal (`articles`) ein einsteigertauglicher
 * Editor; die Kern-Use-Cases (Restaurant anlegen, Kritik schreiben) zeigten rohe
 * englische DB-Feldnamen in einem einzigen langen Formular. Diese Datei hebt das
 * für `articles`, `restaurants` und `restaurant_reviews`.
 *
 * Reihenfolge: NACH `pnpm schema:apply` ausführen, damit additive Felder
 * (image_file, gallery_files) bereits existieren und Gruppen zugeordnet werden
 * können. Fehlende Felder werden übersprungen, nicht angelegt.
 *
 * Usage:  pnpm fields:refine   (Directus läuft, .env mit ADMIN_*)
 */
import { createField, readFields, updateField } from "@directus/sdk";
import { authenticatedClient, type Client } from "./client.js";

/** de-DE-Übersetzung im Directus-Meta-Format. */
function de(translation: string) {
  return [{ language: "de-DE", translation }];
}

/** Gemeinsame Notiz für Publikations-Status (reviews/articles): SEC-1 + Build-Verzug. */
const PUBLISH_NOTE =
  'Nur „Veröffentlicht" erscheint öffentlich – und erst beim nächsten automatischen Build (bis zu ~3 Min). „Entwurf"/„Intern" bleiben privat.';

interface GroupDef {
  field: string;
  label: string;
  sort: number;
  open?: boolean;
}
interface FieldCfg {
  group: string;
  label?: string;
  note?: string;
  hidden?: boolean;
  sort?: number;
}
interface CollectionRefinement {
  collection: string;
  groups: GroupDef[];
  fields: Record<string, FieldCfg>;
}

const TITELBILD_NOTE = "Großes Bild oben/auf der Karte. Hierhin hochladen.";

const REFINEMENTS: CollectionRefinement[] = [
  // ── Journal-Artikel (unverändert zur bisherigen E1.4-Konfiguration) ──────────
  {
    collection: "articles",
    groups: [
      { field: "group_inhalt", label: "Inhalt", sort: 1, open: true },
      { field: "group_bilder", label: "Bilder", sort: 2, open: true },
      { field: "group_seo", label: "SEO", sort: 3 },
      { field: "group_verknuepfungen", label: "Verknüpfungen", sort: 4 },
    ],
    fields: {
      eyebrow: { group: "group_inhalt", label: "Kicker (Eyebrow)", sort: 1 },
      title: { group: "group_inhalt", label: "Titel", sort: 2 },
      slug: { group: "group_inhalt", label: "URL-Kürzel (Slug)", sort: 3 },
      status: { group: "group_inhalt", label: "Status", note: PUBLISH_NOTE, sort: 4 },
      published_date: { group: "group_inhalt", label: "Veröffentlicht am", sort: 5 },
      summary: { group: "group_inhalt", label: "Zusammenfassung", sort: 6 },
      body: { group: "group_inhalt", label: "Beitragstext", sort: 7 },
      image_file: { group: "group_bilder", label: "Titelbild", note: TITELBILD_NOTE, sort: 1 },
      gallery_files: { group: "group_bilder", label: "Galerie", note: "Mehrere Bilder.", sort: 2 },
      image: { group: "group_bilder", label: "Titelbild-Pfad (Fallback)", hidden: true, sort: 3 },
      gallery_images: {
        group: "group_bilder",
        label: "Galerie-Pfade (Fallback)",
        hidden: true,
        sort: 4,
      },
      seo_title: { group: "group_seo", label: "SEO-Titel", sort: 1 },
      seo_description: { group: "group_seo", label: "SEO-Beschreibung", sort: 2 },
      tags: { group: "group_verknuepfungen", label: "Tags", sort: 1 },
      related_restaurant_slugs: {
        group: "group_verknuepfungen",
        label: "Verknüpfte Restaurants",
        sort: 2,
      },
      related_recipe_slugs: { group: "group_verknuepfungen", label: "Verknüpfte Rezepte", sort: 3 },
      related_cocktail_slugs: {
        group: "group_verknuepfungen",
        label: "Verknüpfte Cocktails",
        sort: 4,
      },
    },
  },
  // ── Restaurants (Kern-Use-Case 1) ───────────────────────────────────────────
  {
    collection: "restaurants",
    groups: [
      { field: "group_allgemein", label: "Allgemein", sort: 1, open: true },
      { field: "group_ort", label: "Ort & Küche", sort: 2, open: true },
      { field: "group_medien", label: "Bilder", sort: 3, open: true },
      { field: "group_verknuepfungen", label: "Links & Notizen", sort: 4 },
    ],
    fields: {
      name: { group: "group_allgemein", label: "Name", sort: 1 },
      slug: { group: "group_allgemein", label: "URL-Kürzel (Slug)", sort: 2 },
      status: {
        group: "group_allgemein",
        label: "Status",
        note: "Lebenszyklus (Merkliste, geplant, besucht …). Änderungen erscheinen erst beim nächsten automatischen Build (bis zu ~3 Min).",
        sort: 3,
      },
      priority: { group: "group_allgemein", label: "Priorität", sort: 4 },
      city: { group: "group_ort", label: "Stadt", sort: 1 },
      region: { group: "group_ort", label: "Region", sort: 2 },
      cuisine: { group: "group_ort", label: "Küche", sort: 3 },
      price_level: { group: "group_ort", label: "Preisniveau", sort: 4 },
      image_file: { group: "group_medien", label: "Titelbild", note: TITELBILD_NOTE, sort: 1 },
      image: { group: "group_medien", label: "Titelbild-Pfad (Fallback)", hidden: true, sort: 2 },
      website: { group: "group_verknuepfungen", label: "Website", sort: 1 },
      reservation_url: { group: "group_verknuepfungen", label: "Reservierungs-Link", sort: 2 },
      maps_url: { group: "group_verknuepfungen", label: "Karten-Link", sort: 3 },
      tags: { group: "group_verknuepfungen", label: "Tags", sort: 4 },
      note: { group: "group_verknuepfungen", label: "Notiz", sort: 5 },
    },
  },
  // ── Restaurantkritiken (Kern-Use-Case 2) ────────────────────────────────────
  {
    collection: "restaurant_reviews",
    groups: [
      { field: "group_inhalt", label: "Inhalt", sort: 1, open: true },
      { field: "group_bilder", label: "Bilder", sort: 2, open: true },
    ],
    fields: {
      title: { group: "group_inhalt", label: "Titel", sort: 1 },
      slug: { group: "group_inhalt", label: "URL-Kürzel (Slug)", sort: 2 },
      status: { group: "group_inhalt", label: "Status", note: PUBLISH_NOTE, sort: 3 },
      restaurant: { group: "group_inhalt", label: "Restaurant", sort: 4 },
      visited_on: { group: "group_inhalt", label: "Besucht am", sort: 5 },
      rating: { group: "group_inhalt", label: "Bewertung (1–5 Sterne)", sort: 6 },
      excerpt: { group: "group_inhalt", label: "Kurzfassung", sort: 7 },
      body: { group: "group_inhalt", label: "Kritiktext", sort: 8 },
      image_file: { group: "group_bilder", label: "Titelbild", note: TITELBILD_NOTE, sort: 1 },
      gallery_images: { group: "group_bilder", label: "Galerie-Pfade", sort: 2 },
      image: { group: "group_bilder", label: "Titelbild-Pfad (Fallback)", hidden: true, sort: 3 },
    },
  },
];

/** Aktuelle Feld-Meta je Feld einer Collection (für sicheres read-then-merge). */
async function fieldMeta(
  client: Client,
  collection: string,
): Promise<Map<string, Record<string, unknown>>> {
  const fields = (await client.request(readFields())) as Array<{
    collection: string;
    field: string;
    meta?: Record<string, unknown> | null;
  }>;
  return new Map(
    fields.filter((f) => f.collection === collection).map((f) => [f.field, f.meta ?? {}]),
  );
}

async function refineCollection(client: Client, def: CollectionRefinement) {
  console.log(`[fields] ${def.collection}: refine…`);
  const existing = await fieldMeta(client, def.collection);
  if (existing.size === 0) {
    console.warn(`[fields] ${def.collection}: Collection/Felder fehlen – übersprungen.`);
    return;
  }

  // 1) Gruppen-Container (alias/group-detail) anlegen, falls noch nicht da.
  for (const g of def.groups) {
    if (existing.has(g.field)) {
      console.log(`[fields] ${def.collection}: group exists ${g.field}`);
      continue;
    }
    await client.request(
      createField(def.collection, {
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
    console.log(`[fields] ${def.collection}: created group ${g.field}`);
  }

  // 2) Felder den Gruppen zuordnen + deutsche Labels/Notizen/Sichtbarkeit.
  //    read-then-merge: bestehende Meta (interface/special/options) bleibt erhalten.
  for (const [field, cfg] of Object.entries(def.fields)) {
    const current = existing.get(field);
    if (!current) {
      console.warn(`[fields] ${def.collection}: skip (Feld fehlt) ${field}`);
      continue;
    }
    const meta: Record<string, unknown> = { ...current, group: cfg.group };
    if (cfg.label) meta.translations = de(cfg.label);
    if (cfg.note !== undefined) meta.note = cfg.note;
    if (cfg.hidden !== undefined) meta.hidden = cfg.hidden;
    if (cfg.sort !== undefined) meta.sort = cfg.sort;
    try {
      await client.request(updateField(def.collection, field, { meta } as never));
      console.log(`[fields] ${def.collection}: updated ${field}`);
    } catch (error) {
      const m = (error as { message?: string }).message ?? String(error);
      console.warn(`[fields] ${def.collection}.${field}: übersprungen (${m})`);
    }
  }
}

async function main() {
  console.log("[fields] connecting to Directus…");
  const client = await authenticatedClient();
  console.log("[fields] authenticated.");

  for (const def of REFINEMENTS) {
    await refineCollection(client, def);
  }

  console.log("[fields] done.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[fields] failed:", error);
    process.exit(1);
  });
