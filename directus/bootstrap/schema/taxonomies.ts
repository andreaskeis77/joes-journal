import type { CollectionDef } from "../schema-helpers.js";

const TAXONOMIES: Array<{ collection: string; icon: string; note: string }> = [
  { collection: "tax_cuisines", icon: "restaurant_menu", note: "Küchenrichtungen" },
  { collection: "tax_locations", icon: "place", note: "Städte / Regionen" },
  { collection: "tax_tags", icon: "label", note: "Freie Tags" },
  { collection: "tax_ingredient_categories", icon: "category", note: "Zutatenkategorien" },
  { collection: "tax_equipment_categories", icon: "kitchen", note: "Gerätekategorien" },
  { collection: "tax_supplier_types", icon: "local_shipping", note: "Lieferantentypen" },
];

export const taxonomyCollections: CollectionDef[] = TAXONOMIES.map(
  ({ collection, icon, note }) => ({
    collection,
    meta: {
      icon,
      note,
      display_template: "{{name}}",
      sort_field: "name",
      group: "taxonomies",
    },
    fields: [
      {
        field: "slug",
        type: "string",
        meta: { interface: "input", width: "half", required: true, options: { slug: true } },
        schema: { is_unique: true, is_nullable: false },
      },
      {
        field: "name",
        type: "string",
        meta: { interface: "input", width: "half", required: true },
        schema: { is_nullable: false },
      },
      {
        field: "description",
        type: "text",
        meta: { interface: "input-multiline", width: "full" },
        schema: { is_nullable: true },
      },
    ],
  }),
);

export const taxonomyCollectionNames = TAXONOMIES.map((t) => t.collection);
