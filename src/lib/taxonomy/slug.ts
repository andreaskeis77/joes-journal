/**
 * Deutsch-bewusste Slugifizierung für Taxonomie-Terme.
 *
 * Gemeinsame Quelle für Seed (directus/bootstrap/seed.ts) und die E2-Migration
 * (directus/bootstrap/migrate-taxonomies.ts): beide müssen Freitext-Strings
 * (z. B. "Île-de-France", "Französisch · Bistro") deterministisch auf denselben
 * Term-Slug abbilden, damit das Matching idempotent ist.
 */
export function toTermSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // diakritische Zeichen entfernen (é -> e)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Zerlegt ein zusammengesetztes Küchen-/Tag-Feld in einzelne Terme.
 * "Französisch · Bistro" -> ["Französisch", "Bistro"]; trennt an "·", "/", ",".
 */
export function splitTerms(input: string): string[] {
  return input
    .split(/[·/,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
