import type { CollectionDef } from "../schema-helpers.js";
import { RECIPE_DIFFICULTY_OPTIONS } from "./status.js";

export const recipeCollection: CollectionDef = {
  collection: "recipes",
  meta: {
    icon: "menu_book",
    note: "Rezepte mit Zutaten und Schritten.",
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
      field: "image",
      type: "string",
      meta: { interface: "input", width: "full" },
      schema: { is_nullable: true },
    },
    {
      field: "summary",
      type: "text",
      meta: { interface: "input-multiline", width: "full" },
      schema: { is_nullable: true },
    },
    {
      field: "servings",
      type: "integer",
      meta: { interface: "input", width: "half" },
      schema: { default_value: 2, is_nullable: true },
    },
    {
      field: "prep_min",
      type: "integer",
      meta: { interface: "input", width: "half" },
      schema: { default_value: 0, is_nullable: true },
    },
    {
      field: "cook_min",
      type: "integer",
      meta: { interface: "input", width: "half" },
      schema: { default_value: 0, is_nullable: true },
    },
    {
      field: "difficulty",
      type: "string",
      meta: {
        interface: "select-dropdown",
        width: "half",
        options: { choices: RECIPE_DIFFICULTY_OPTIONS },
      },
      schema: { default_value: "leicht", is_nullable: false },
    },
    {
      field: "tags",
      type: "json",
      meta: { interface: "tags", width: "full", special: ["cast-json"] },
      schema: { is_nullable: true },
    },
    {
      field: "ingredients",
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
      field: "steps",
      type: "json",
      meta: {
        interface: "list",
        width: "full",
        special: ["cast-json"],
        note: "Schritte als Array von Strings.",
      },
      schema: { is_nullable: true },
    },
    {
      field: "equipment_slugs",
      type: "json",
      meta: { interface: "tags", width: "full", special: ["cast-json"] },
      schema: { is_nullable: true },
    },
    {
      field: "notes",
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
