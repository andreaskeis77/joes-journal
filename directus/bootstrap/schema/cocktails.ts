import type { CollectionDef } from "../schema-helpers.js";
import { COCKTAIL_TYPE_OPTIONS } from "./status.js";

export const cocktailCollection: CollectionDef = {
  collection: "cocktails",
  meta: {
    icon: "local_bar",
    note: "Cocktails und Mocktails mit Technik, Glas, Rezeptur.",
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
      field: "type",
      type: "string",
      meta: {
        interface: "select-dropdown",
        width: "half",
        options: { choices: COCKTAIL_TYPE_OPTIONS },
      },
      schema: { default_value: "alkoholisch", is_nullable: false },
    },
    {
      field: "glass",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "ice",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "technique",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "flavor_profile",
      type: "text",
      meta: { interface: "input-multiline", width: "full" },
      schema: { is_nullable: true },
    },
    {
      field: "image",
      type: "string",
      meta: { interface: "input", width: "full" },
      schema: { is_nullable: true },
    },
    {
      field: "pours",
      type: "json",
      meta: {
        interface: "list",
        width: "full",
        special: ["cast-json"],
        note: "[{ amount, item, ingredient_slug? }]",
      },
      schema: { is_nullable: true },
    },
    {
      field: "garnish",
      type: "string",
      meta: { interface: "input", width: "full" },
      schema: { is_nullable: true },
    },
    {
      field: "preparation",
      type: "json",
      meta: { interface: "list", width: "full", special: ["cast-json"] },
      schema: { is_nullable: true },
    },
    {
      field: "variants",
      type: "json",
      meta: { interface: "list", width: "full", special: ["cast-json"] },
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
