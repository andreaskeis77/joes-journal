import type { FieldDef, RelationDef } from "../schema-helpers.js";

/**
 * E1.3 – Directus Files (Bild-Upload).
 *
 * Additive `image_file`-Referenz (m2o -> directus_files) auf den visuellen
 * Collections. Das bestehende `image`-Pfad-Feld bleibt als Fallback bestehen;
 * der Build-Zeit-Bake (deploy/bake-files.mjs) laedt referenzierte Dateien nach
 * public/_uploads/ und der Loader bevorzugt sie. Reines Hinzufuegen -> per
 * `schema:apply` idempotent nachruestbar, ohne bestehende Daten zu veraendern.
 */
export const imageFileField: FieldDef = {
  field: "image_file",
  type: "uuid",
  meta: {
    interface: "file-image",
    width: "full",
    special: ["file"],
    note: "Bild-Upload (Directus File). Gewinnt beim Build ueber das Pfad-Feld 'image'.",
  },
  schema: { is_nullable: true },
};

/** Collections mit Hero-/Karten-Bild, die den Datei-Upload erhalten. */
export const mediaCollections = [
  "restaurants",
  "restaurant_reviews",
  "articles",
  "recipes",
  "cocktails",
  "equipment",
];

export const fileRelations: RelationDef[] = mediaCollections.map((collection) => ({
  collection,
  field: "image_file",
  related_collection: "directus_files",
  // SET NULL: Wird eine Datei geloescht, faellt das Feld auf null zurueck und
  // der Loader nutzt wieder den `image`-Pfad als Fallback.
  schema: { on_delete: "SET NULL" },
}));
