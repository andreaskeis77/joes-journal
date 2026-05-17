import type { CollectionDef } from "../schema-helpers.js";

export const linkCollection: CollectionDef = {
  collection: "links",
  meta: {
    icon: "link",
    note: "Externe Links mit optionalen Verknüpfungen zu Inhalten.",
    display_template: "{{label}}",
    sort_field: "label",
    group: "content",
  },
  fields: [
    {
      field: "url",
      type: "string",
      meta: {
        interface: "input",
        width: "full",
        required: true,
        options: { placeholder: "https://" },
      },
      schema: { is_nullable: false },
    },
    {
      field: "label",
      type: "string",
      meta: { interface: "input", width: "half", required: true },
      schema: { is_nullable: false },
    },
    {
      field: "source",
      type: "string",
      meta: { interface: "input", width: "half", note: "Quelle / Domain-Hinweis." },
      schema: { is_nullable: true },
    },
    {
      field: "restaurant_slug",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "recipe_slug",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "cocktail_slug",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "equipment_slug",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "date_created",
      type: "timestamp",
      meta: { special: ["date-created"], interface: "datetime", readonly: true, hidden: true },
    },
    {
      field: "date_updated",
      type: "timestamp",
      meta: { special: ["date-updated"], interface: "datetime", readonly: true, hidden: true },
    },
  ],
};
