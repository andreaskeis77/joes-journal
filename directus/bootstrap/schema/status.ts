/**
 * Shared content status values reused across content collections.
 */
export const CONTENT_STATUS_OPTIONS = [
  { text: "Entwurf", value: "draft" },
  { text: "Intern", value: "internal" },
  { text: "Veröffentlicht", value: "published" },
  { text: "Archiviert", value: "archived" },
];

export const RESTAURANT_STATUS_OPTIONS = [
  { text: "Entdeckt", value: "discovered" },
  { text: "Merkliste", value: "wishlist" },
  { text: "Geplant", value: "planned" },
  { text: "Besucht", value: "visited" },
  { text: "Kritik vorhanden", value: "reviewed" },
  { text: "Wieder besuchen", value: "revisit" },
  { text: "Geschlossen", value: "closed" },
  { text: "Archiviert", value: "archived" },
];

export const PRIORITY_OPTIONS = [
  { text: "Hoch", value: "hoch" },
  { text: "Mittel", value: "mittel" },
  { text: "Niedrig", value: "niedrig" },
];

export const EQUIPMENT_STATUS_OPTIONS = [
  { text: "Im Besitz", value: "owned" },
  { text: "Wunschliste", value: "wishlist" },
  { text: "Archiviert", value: "archived" },
];

export const COCKTAIL_TYPE_OPTIONS = [
  { text: "Alkoholisch", value: "alkoholisch" },
  { text: "Alkoholfrei", value: "alkoholfrei" },
];

export const RECIPE_DIFFICULTY_OPTIONS = [
  { text: "Leicht", value: "leicht" },
  { text: "Mittel", value: "mittel" },
  { text: "Anspruchsvoll", value: "anspruchsvoll" },
];

export const COLLECTION_TYPE_OPTIONS = [
  { text: "Manuell", value: "manual" },
  { text: "Dynamische Sicht", value: "saved_view" },
];
