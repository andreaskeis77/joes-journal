import type { CollectionDef } from "../schema-helpers.js";
import { EQUIPMENT_STATUS_OPTIONS } from "./status.js";

export const equipmentCollection: CollectionDef = {
  collection: "equipment",
  meta: {
    icon: "kitchen",
    note: "Geräte und Wunschliste.",
    display_template: "{{name}}",
    sort_field: "name",
    archive_field: "status",
    archive_value: "archived",
    unarchive_value: "wishlist",
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
      field: "status",
      type: "string",
      meta: {
        interface: "select-dropdown",
        width: "half",
        options: { choices: EQUIPMENT_STATUS_OPTIONS },
      },
      schema: { default_value: "wishlist", is_nullable: false },
    },
    {
      field: "category",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "manufacturer",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "model",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "product_url",
      type: "string",
      meta: { interface: "input", width: "full", options: { placeholder: "https://" } },
      schema: { is_nullable: true },
    },
    {
      field: "image",
      type: "string",
      meta: { interface: "input", width: "full" },
      schema: { is_nullable: true },
    },
    {
      field: "note",
      type: "text",
      meta: { interface: "input-multiline", width: "full" },
      schema: { is_nullable: true },
    },
    {
      field: "linked_recipe_slugs",
      type: "json",
      meta: { interface: "tags", width: "full", special: ["cast-json"] },
      schema: { is_nullable: true },
    },
    {
      field: "linked_cocktail_slugs",
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
