import type { CollectionDef, FieldDef, RelationDef } from "../schema-helpers.js";

/**
 * Phase 4 – echte Mehrfach-Bild-Galerie für Artikel als m2m auf directus_files.
 *
 * Ersetzt die kaputte `gallery_images`-„Liste" (Repeater → leere Objekte) durch
 * einen echten Datei-Mehrfach-Picker (`interface: "files"`). Directus-m2m =
 * Junction-Collection `articles_files` mit zwei m2o-Feldern (articles_id,
 * directus_files_id) + Sortierfeld, plus ein Alias-Feld `gallery_files` auf
 * `articles`. Das alte `gallery_images` bleibt als versteckter Fallback (keine
 * Daten-Migration). Der Build-Bake lädt die referenzierten Dateien nach
 * /_uploads/ (siehe bake-files.mjs §1c + loader resolveGallery).
 *
 * Additiv über `pnpm schema:apply` (ensureCollection/Field/Relation, idempotent).
 */

/** Junction-Collection Artikel ↔ Galerie-Dateien. `id` wird automatisch ergänzt. */
export const galleryJunctionCollection: CollectionDef = {
  collection: "articles_files",
  meta: {
    icon: "collections",
    note: "Junction: Artikel ↔ Galerie-Dateien (m2m, intern).",
    hidden: true,
  },
  fields: [
    {
      field: "articles_id",
      type: "uuid",
      meta: { interface: "select-dropdown-m2o", special: ["m2o"], hidden: true },
      schema: { is_nullable: true },
    },
    {
      field: "directus_files_id",
      type: "uuid",
      meta: { interface: "file", special: ["file"], hidden: true },
      schema: { is_nullable: true },
    },
    {
      field: "sort",
      type: "integer",
      meta: { interface: "input", hidden: true },
      schema: { is_nullable: true },
    },
  ],
};

/** Alias-Feld auf `articles`: der sichtbare Galerie-Mehrfach-Upload. */
export const galleryField: FieldDef = {
  field: "gallery_files",
  type: "alias",
  meta: {
    interface: "files",
    special: ["files"],
    width: "full",
    note: "Galerie – mehrere Bilder hochladen. Werden beim Build lokal eingebacken.",
  },
  schema: null,
};

/**
 * Die zwei m2o-Relationen, die zusammen die m2m bilden.
 * - articles_id → articles trägt `one_field` (das Alias-Feld) + `junction_field`.
 * - directus_files_id → directus_files trägt nur das `junction_field` zurück.
 * Beide CASCADE: gelöschter Artikel bzw. gelöschte Datei räumt Junction-Zeilen ab.
 */
export const galleryRelations: RelationDef[] = [
  {
    collection: "articles_files",
    field: "articles_id",
    related_collection: "articles",
    meta: {
      one_field: "gallery_files",
      sort_field: "sort",
      one_collection_field: null,
      one_allowed_collections: null,
      junction_field: "directus_files_id",
    },
    schema: { on_delete: "CASCADE" },
  },
  {
    collection: "articles_files",
    field: "directus_files_id",
    related_collection: "directus_files",
    meta: {
      one_field: null,
      sort_field: null,
      one_collection_field: null,
      one_allowed_collections: null,
      junction_field: "articles_id",
    },
    schema: { on_delete: "CASCADE" },
  },
];
