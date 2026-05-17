import type { CollectionDef, RelationDef } from "../schema-helpers.js";
import { CONTENT_STATUS_OPTIONS, PRIORITY_OPTIONS, RESTAURANT_STATUS_OPTIONS } from "./status.js";

export const restaurantCollection: CollectionDef = {
  collection: "restaurants",
  meta: {
    icon: "restaurant",
    note: "Restaurants – Stammdaten, Watchlist und Besuche.",
    display_template: "{{name}} – {{city}}",
    sort_field: "name",
    archive_field: "status",
    archive_value: "archived",
    unarchive_value: "discovered",
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
        options: { choices: RESTAURANT_STATUS_OPTIONS },
      },
      schema: { default_value: "discovered", is_nullable: false },
    },
    {
      field: "priority",
      type: "string",
      meta: {
        interface: "select-dropdown",
        width: "half",
        options: { choices: PRIORITY_OPTIONS },
      },
      schema: { default_value: "mittel", is_nullable: false },
    },
    {
      field: "city",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "region",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "cuisine",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "price_level",
      type: "integer",
      meta: {
        interface: "select-dropdown",
        width: "half",
        options: {
          choices: [
            { text: "€", value: 1 },
            { text: "€€", value: 2 },
            { text: "€€€", value: 3 },
            { text: "€€€€", value: 4 },
          ],
        },
      },
      schema: { default_value: 2, is_nullable: true },
    },
    {
      field: "tags",
      type: "json",
      meta: {
        interface: "tags",
        width: "full",
        special: ["cast-json"],
      },
      schema: { is_nullable: true },
    },
    {
      field: "note",
      type: "text",
      meta: { interface: "input-multiline", width: "full" },
      schema: { is_nullable: true },
    },
    {
      field: "image",
      type: "string",
      meta: { interface: "input", width: "full", note: "Relativer Pfad oder URL." },
      schema: { is_nullable: true },
    },
    {
      field: "website",
      type: "string",
      meta: { interface: "input", width: "half", options: { placeholder: "https://" } },
      schema: { is_nullable: true },
    },
    {
      field: "reservation_url",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "maps_url",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "date_created",
      type: "timestamp",
      meta: {
        special: ["date-created"],
        interface: "datetime",
        readonly: true,
        hidden: true,
        width: "half",
      },
    },
    {
      field: "date_updated",
      type: "timestamp",
      meta: {
        special: ["date-updated"],
        interface: "datetime",
        readonly: true,
        hidden: true,
        width: "half",
      },
    },
  ],
};

export const reviewCollection: CollectionDef = {
  collection: "restaurant_reviews",
  meta: {
    icon: "rate_review",
    note: "Restaurantkritiken mit 5-Sterne-Bewertung.",
    display_template: "{{title}}",
    sort_field: "visited_on",
    archive_field: "status",
    archive_value: "archived",
    unarchive_value: "draft",
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
      field: "status",
      type: "string",
      meta: {
        interface: "select-dropdown",
        width: "half",
        options: { choices: CONTENT_STATUS_OPTIONS },
      },
      schema: { default_value: "draft", is_nullable: false },
    },
    {
      field: "restaurant",
      type: "uuid",
      meta: {
        interface: "select-dropdown-m2o",
        width: "half",
        required: true,
        special: ["m2o"],
      },
      schema: { is_nullable: false },
    },
    {
      field: "visited_on",
      type: "date",
      meta: { interface: "datetime", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "rating",
      type: "decimal",
      meta: {
        interface: "input",
        width: "half",
        note: "5-Sterne-Bewertung (1.0–5.0 in 0.5-Schritten).",
      },
      schema: { numeric_precision: 2, numeric_scale: 1, is_nullable: false, default_value: 0 },
    },
    {
      field: "excerpt",
      type: "text",
      meta: { interface: "input-multiline", width: "full" },
      schema: { is_nullable: true },
    },
    {
      field: "body",
      type: "json",
      meta: {
        interface: "list",
        width: "full",
        special: ["cast-json"],
        note: "Absätze als Array von Strings.",
      },
      schema: { is_nullable: true },
    },
    {
      field: "image",
      type: "string",
      meta: { interface: "input", width: "full" },
      schema: { is_nullable: true },
    },
    {
      field: "gallery_images",
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

export const restaurantRelations: RelationDef[] = [
  {
    collection: "restaurant_reviews",
    field: "restaurant",
    related_collection: "restaurants",
    meta: {
      one_field: "reviews",
      one_collection_field: null,
      one_allowed_collections: null,
      junction_field: null,
      sort_field: null,
    },
    schema: { on_delete: "SET NULL" },
  },
];
