import type { CollectionDef, FieldDef, RelationDef } from "../schema-helpers.js";

/**
 * E2 - Additive relationale Taxonomie-Verknüpfungen für `restaurants`.
 *
 * BEWUSST GETRENNT von schema:apply (siehe apply-taxonomy-relations.ts), weil
 * M2M-Junctions komplexer und riskanter sind als einfache Feld-Adds. Erst auf
 * einer Restore-Drill-Kopie ausführen (MIGRATION_E2.md), dann live.
 *
 * Rein additiv: legt Junction-Collections, Alias-Felder und ein M2O-Feld an.
 * Verändert KEINE bestehenden Spalten (`cuisine`, `tags`, `city`, `region`
 * bleiben als Fallback erhalten, bis der Frontend-Cutover erfolgt ist).
 */

/** Versteckte M2M-Junction-Collections (nur restaurants_id + term_id). */
function junction(collection: string, termField: string): CollectionDef {
  return {
    collection,
    meta: { hidden: true, icon: "import_export", note: "M2M-Junction (E2)." },
    fields: [
      {
        field: "restaurants_id",
        type: "uuid",
        meta: { hidden: true },
        schema: { is_nullable: true },
      },
      {
        field: termField,
        type: "uuid",
        meta: { hidden: true },
        schema: { is_nullable: true },
      },
    ],
  };
}

export const junctionCollections: CollectionDef[] = [
  junction("restaurants_cuisines", "tax_cuisines_id"),
  junction("restaurants_tags", "tax_tags_id"),
];

/** Alias-Felder auf `restaurants`, die die M2M-Beziehungen sichtbar machen. */
export const restaurantAliasFields: FieldDef[] = [
  {
    field: "cuisine_terms",
    type: "alias",
    meta: {
      interface: "list-m2m",
      special: ["m2m"],
      note: "Küchen als kontrollierte Terme (E2.1).",
    },
    schema: null,
  },
  {
    field: "tag_terms",
    type: "alias",
    meta: {
      interface: "list-m2m",
      special: ["m2m"],
      note: "Tags als kontrollierte Terme (E2.2).",
    },
    schema: null,
  },
];

/** M2O-Feld auf `restaurants` für die Stadt/Region als Ort-Term (E2.1). */
export const locationField: FieldDef = {
  field: "location_term",
  type: "uuid",
  meta: {
    interface: "select-dropdown-m2o",
    special: ["m2o"],
    note: "Stadt/Region als kontrollierter Ort-Term (E2.1).",
  },
  schema: { is_nullable: true },
};

export const taxonomyRelations: RelationDef[] = [
  // cuisines M2M
  {
    collection: "restaurants_cuisines",
    field: "restaurants_id",
    related_collection: "restaurants",
    meta: { one_field: "cuisine_terms", junction_field: "tax_cuisines_id", sort_field: null },
    schema: { on_delete: "CASCADE" },
  },
  {
    collection: "restaurants_cuisines",
    field: "tax_cuisines_id",
    related_collection: "tax_cuisines",
    meta: { one_field: null, junction_field: "restaurants_id" },
    schema: { on_delete: "CASCADE" },
  },
  // tags M2M
  {
    collection: "restaurants_tags",
    field: "restaurants_id",
    related_collection: "restaurants",
    meta: { one_field: "tag_terms", junction_field: "tax_tags_id", sort_field: null },
    schema: { on_delete: "CASCADE" },
  },
  {
    collection: "restaurants_tags",
    field: "tax_tags_id",
    related_collection: "tax_tags",
    meta: { one_field: null, junction_field: "restaurants_id" },
    schema: { on_delete: "CASCADE" },
  },
  // location M2O
  {
    collection: "restaurants",
    field: "location_term",
    related_collection: "tax_locations",
    schema: { on_delete: "SET NULL" },
  },
];
