/**
 * UI label maps for status values that live as enums in Directus.
 * The Astro components consume the German label; Directus stores the
 * machine-readable value.
 */
import type {
  RestaurantStatus,
  EquipmentStatus,
  CollectionType,
  ReviewStatus,
} from "../../data/stub";

export const RESTAURANT_STATUS_LABELS: Record<RestaurantStatus | string, string> = {
  wishlist: "Merkliste",
  planned: "Geplant",
  visited: "Besucht",
  reviewed: "Kritik vorhanden",
  // Directus also exposes additional values from the dropdown; map them too.
  discovered: "Entdeckt",
  revisit: "Wieder besuchen",
  closed: "Geschlossen",
  archived: "Archiviert",
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus | string, string> = {
  owned: "Im Besitz",
  wishlist: "Wunschliste",
  archived: "Archiviert",
};

export const COLLECTION_TYPE_LABELS: Record<CollectionType | string, string> = {
  manual: "Manuelle Sammlung",
  saved_view: "Dynamische Sicht",
};

export function restaurantStatusLabel(status: string): string {
  return RESTAURANT_STATUS_LABELS[status] ?? status;
}

export function equipmentStatusLabel(status: string): string {
  return EQUIPMENT_STATUS_LABELS[status] ?? status;
}

export function collectionTypeLabel(type: string): string {
  return COLLECTION_TYPE_LABELS[type] ?? type;
}

/**
 * Restaurants store a free-form status string in Directus, but the Astro
 * components currently expect one of the four canonical values used in the
 * stub: wishlist | planned | visited | reviewed. This narrows the value.
 */
export function normalizeRestaurantStatus(raw: string): RestaurantStatus {
  if (raw === "visited" || raw === "revisit") return "visited";
  if (raw === "reviewed") return "reviewed";
  if (raw === "planned") return "planned";
  // discovered, wishlist, closed, archived → "wishlist" bucket for UI
  return "wishlist";
}

export function normalizeEquipmentStatus(raw: string): EquipmentStatus {
  if (raw === "owned") return "owned";
  return "wishlist";
}

export function normalizeCollectionType(raw: string): CollectionType {
  if (raw === "saved_view") return "saved_view";
  return "manual";
}

/**
 * Narrows the free-form editorial status string from Directus into the known
 * review lifecycle. Anything unknown or missing falls back to "draft" — the
 * safest default, because only "published" reaches the public static output.
 */
export function normalizeReviewStatus(raw: string | null | undefined): ReviewStatus {
  if (raw === "published" || raw === "internal" || raw === "archived" || raw === "draft") {
    return raw;
  }
  return "draft";
}
