import type { CollectionDef } from "../schema-helpers.js";

export const supplierCollection: CollectionDef = {
  collection: "suppliers",
  meta: {
    icon: "local_shipping",
    note: "Bezugsquellen für Zutaten und Produkte.",
    display_template: "{{name}} – {{city}}",
    sort_field: "name",
    group: "content",
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
      field: "type",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "city",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "website",
      type: "string",
      meta: { interface: "input", width: "full", options: { placeholder: "https://" } },
      schema: { is_nullable: true },
    },
    {
      field: "note",
      type: "text",
      meta: { interface: "input-multiline", width: "full" },
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

export const ingredientCollection: CollectionDef = {
  collection: "ingredients",
  meta: {
    icon: "spa",
    note: "Zutaten mit Bezug zu Lieferanten.",
    display_template: "{{name}}",
    sort_field: "name",
    group: "content",
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
      field: "category",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "image",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "note",
      type: "text",
      meta: { interface: "input-multiline", width: "full" },
      schema: { is_nullable: true },
    },
    {
      field: "supplier_slugs",
      type: "json",
      meta: { interface: "tags", width: "full", special: ["cast-json"] },
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
