/**
 * Datums-Formatierung fürs Frontend.
 *
 * Gibt bei fehlendem oder ungültigem Datum einen LEEREN String zurück, statt
 * `new Date("").toLocaleDateString()` -> "Invalid Date" auf der Seite zu rendern.
 * Relevant, weil die Directus-Mapper bei NULL einen leeren String liefern
 * (visited_on/published_date) und `published_date` nur optional automatisch
 * gesetzt wird – ein veröffentlichter Beitrag ohne Datum darf kein "Invalid Date"
 * zeigen.
 */
export function formatGermanDate(
  iso: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("de-DE", options);
}
