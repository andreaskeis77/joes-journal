import type { CollectionDef } from "../schema-helpers.js";
import { COLLECTION_TYPE_OPTIONS } from "./status.js";

export const collectionCollection: CollectionDef = {
  collection: "content_collections",
  meta: {
    icon: "collections_bookmark",
    note: "Kuratierte Sammlungen (manuell oder dynamisch).",
    display_template: "{{title}}",
    sort_field: "title",
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
      field: "title",
      type: "string",
      meta: { interface: "input", width: "half", required: true },
      schema: { is_nullable: false },
    },
    {
      field: "type",
      type: "string",
      meta: {
        interface: "select-dropdown",
        width: "half",
        options: { choices: COLLECTION_TYPE_OPTIONS },
      },
      schema: { default_value: "manual", is_nullable: false },
    },
    {
      field: "image",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "description",
      type: "text",
      meta: { interface: "input-multiline", width: "full" },
      schema: { is_nullable: true },
    },
    {
      field: "restaurant_slugs",
      type: "json",
      meta: { interface: "tags", width: "full", special: ["cast-json"] },
      schema: { is_nullable: true },
    },
    {
      field: "recipe_slugs",
      type: "json",
      meta: { interface: "tags", width: "full", special: ["cast-json"] },
      schema: { is_nullable: true },
    },
    {
      field: "cocktail_slugs",
      type: "json",
      meta: { interface: "tags", width: "full", special: ["cast-json"] },
      schema: { is_nullable: true },
    },
    {
      field: "equipment_slugs",
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
