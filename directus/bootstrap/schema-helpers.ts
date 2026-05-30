import {
  createCollection,
  createField,
  createRelation,
  readCollections,
  readFields,
} from "@directus/sdk";
import type { Client } from "./client.js";

export interface FieldDef {
  field: string;
  type:
    | "string"
    | "text"
    | "integer"
    | "bigInteger"
    | "float"
    | "decimal"
    | "boolean"
    | "uuid"
    | "json"
    | "date"
    | "dateTime"
    | "timestamp"
    | "alias";
  meta?: Record<string, unknown>;
  schema?: Record<string, unknown> | null;
}

export interface CollectionDef {
  collection: string;
  meta?: {
    icon?: string;
    note?: string;
    display_template?: string;
    sort_field?: string | null;
    archive_field?: string | null;
    archive_value?: string | null;
    unarchive_value?: string | null;
    accountability?: "all" | "activity" | null;
    singleton?: boolean;
    hidden?: boolean;
    group?: string | null;
    color?: string | null;
  };
  fields: FieldDef[];
}

export interface RelationDef {
  collection: string;
  field: string;
  related_collection: string;
  meta?: Record<string, unknown>;
  schema?: {
    on_delete?: "NO ACTION" | "SET NULL" | "CASCADE";
  };
}

/**
 * Creates the collection (with all its fields) if it does not yet exist.
 * Returns `true` if it created the collection, `false` if it already existed.
 * When it returns `false`, the caller is responsible for reconciling
 * individual fields via {@link ensureField} — this function only creates
 * fields at initial collection creation time.
 */
export async function ensureCollection(
  client: Client,
  definition: CollectionDef,
  existing: Set<string>,
): Promise<boolean> {
  if (existing.has(definition.collection)) {
    return false;
  }
  const idField: FieldDef = {
    field: "id",
    type: "uuid",
    meta: { hidden: true, readonly: true, interface: "input", special: ["uuid"] },
    schema: { is_primary_key: true, has_auto_increment: false },
  };
  const fieldsWithId = [idField, ...definition.fields];
  await client.request(
    createCollection({
      collection: definition.collection,
      meta: {
        icon: definition.meta?.icon ?? null,
        note: definition.meta?.note ?? null,
        display_template: definition.meta?.display_template ?? null,
        sort_field: definition.meta?.sort_field ?? null,
        archive_field: definition.meta?.archive_field ?? null,
        archive_value: definition.meta?.archive_value ?? null,
        unarchive_value: definition.meta?.unarchive_value ?? null,
        accountability: definition.meta?.accountability ?? "all",
        singleton: definition.meta?.singleton ?? false,
        hidden: definition.meta?.hidden ?? false,
        color: definition.meta?.color ?? null,
      },
      schema: {},
      fields: fieldsWithId.map((f) => ({
        field: f.field,
        type: f.type,
        meta: { collection: definition.collection, field: f.field, ...(f.meta ?? {}) },
        schema: f.schema === null ? null : { name: f.field, ...(f.schema ?? {}) },
      })) as never,
    } as never),
  );
  existing.add(definition.collection);
  console.log(`[schema] created collection: ${definition.collection}`);
  return true;
}

export async function ensureField(
  client: Client,
  collection: string,
  field: FieldDef,
  existingFields: Set<string>,
): Promise<void> {
  const key = `${collection}.${field.field}`;
  if (existingFields.has(key)) {
    return;
  }
  await client.request(
    createField(collection, {
      field: field.field,
      type: field.type,
      meta: { collection, field: field.field, ...(field.meta ?? {}) },
      schema: field.schema === null ? null : { name: field.field, ...(field.schema ?? {}) },
    } as never),
  );
  existingFields.add(key);
  console.log(`[schema] created field: ${key}`);
}

export async function ensureRelation(client: Client, relation: RelationDef): Promise<void> {
  try {
    await client.request(
      createRelation({
        collection: relation.collection,
        field: relation.field,
        related_collection: relation.related_collection,
        meta: relation.meta,
        schema: relation.schema,
      } as never),
    );
    console.log(
      `[schema] created relation: ${relation.collection}.${relation.field} → ${relation.related_collection}`,
    );
  } catch (error) {
    const message = (error as { message?: string }).message ?? String(error);
    if (message.includes("already exists") || message.includes("duplicate")) {
      return;
    }
    throw error;
  }
}

export async function snapshot(client: Client): Promise<{
  collections: Set<string>;
  fields: Set<string>;
}> {
  const collections = (await client.request(readCollections())) as Array<{
    collection: string;
  }>;
  const fields = (await client.request(readFields())) as Array<{
    collection: string;
    field: string;
  }>;
  return {
    collections: new Set(collections.map((c) => c.collection)),
    fields: new Set(fields.map((f) => `${f.collection}.${f.field}`)),
  };
}
