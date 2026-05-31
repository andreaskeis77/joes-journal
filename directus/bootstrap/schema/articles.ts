import type { CollectionDef } from "../schema-helpers.js";
import { CONTENT_STATUS_OPTIONS } from "./status.js";

/**
 * Freie Journal-Beiträge (Essays, Notizen, Reportagen) – zusätzlich zu den
 * strukturierten Typen. Teilt das Status-Gate (SEC-1) mit Kritiken: nur
 * `published` erreicht den statischen Output. Bild als Pfad-String (E1.3
 * ergänzt additiv eine File-Referenz); Verknüpfungen als Slug-Arrays (relational
 * erst ab E2).
 */
export const articleCollection: CollectionDef = {
  collection: "articles",
  meta: {
    icon: "article",
    note: "Journal – freie Beiträge (Essays, Notizen, Reportagen).",
    display_template: "{{title}} – {{status}}",
    sort_field: "published_date",
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
      field: "published_date",
      type: "date",
      meta: { interface: "datetime", width: "half" },
      schema: { is_nullable: true },
    },
    {
      field: "eyebrow",
      type: "string",
      meta: { interface: "input", width: "half", note: "Kicker über der Überschrift." },
      schema: { is_nullable: true },
    },
    {
      field: "summary",
      type: "text",
      meta: { interface: "input-multiline", width: "full" },
      schema: { is_nullable: true },
    },
    {
      field: "body",
      type: "text",
      meta: {
        interface: "input-rich-text-html",
        width: "full",
        note: "Beitragstext. Formatierung über die Werkzeugleiste (fett, Überschrift, Liste); Bilder über den Bild-Button direkt im Text.",
      },
      schema: { is_nullable: true },
    },
    {
      field: "image",
      type: "string",
      meta: { interface: "input", width: "full", note: "Hero – relativer Pfad oder URL." },
      schema: { is_nullable: true },
    },
    {
      field: "gallery_images",
      type: "json",
      meta: { interface: "list", width: "full", special: ["cast-json"] },
      schema: { is_nullable: true },
    },
    {
      field: "tags",
      type: "json",
      meta: { interface: "tags", width: "full", special: ["cast-json"] },
      schema: { is_nullable: true },
    },
    {
      field: "related_restaurant_slugs",
      type: "json",
      meta: { interface: "tags", width: "half", special: ["cast-json"] },
      schema: { is_nullable: true },
    },
    {
      field: "related_recipe_slugs",
      type: "json",
      meta: { interface: "tags", width: "half", special: ["cast-json"] },
      schema: { is_nullable: true },
    },
    {
      field: "related_cocktail_slugs",
      type: "json",
      meta: { interface: "tags", width: "half", special: ["cast-json"] },
      schema: { is_nullable: true },
    },
    {
      field: "seo_title",
      type: "string",
      meta: { interface: "input", width: "half", note: "Optional – fällt sonst auf title zurück." },
      schema: { is_nullable: true },
    },
    {
      field: "seo_description",
      type: "text",
      meta: {
        interface: "input-multiline",
        width: "full",
        note: "Optional – fällt sonst auf summary zurück.",
      },
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
