/**
 * E3.3 - Strukturierte Zutatenmengen.
 *
 * Zutaten werden derzeit als kombinierter String gepflegt ("200 g", "2 EL",
 * "nach Bedarf"). Dieser Parser zerlegt sie in eine maschinen-nutzbare Struktur
 * (Menge + Einheit), ohne den bestehenden String zu verlieren. Grundlage für
 * Portions-Skalierung und – später, als eigene Migration – relationale
 * Zutaten-Rows (DATA_MODEL §10).
 *
 * Bewusst konservativ: nur ein klarer Zahlen-Präfix wird als Menge erkannt.
 * Freitext ("ein paar Zweige", Bereiche "75-90") behält `quantity = null` und
 * wird unverändert ausgegeben — nie geraten.
 */
export interface ParsedAmount {
  /** Numerische Menge, falls eindeutig erkennbar; sonst null. */
  quantity: number | null;
  /** Einheit/Rest hinter der Zahl ("g", "EL", "Prise", ""); null wenn keine Zahl. */
  unit: string | null;
  /** Originalstring, immer erhalten. */
  raw: string;
}

const LEADING_NUMBER = /^(\d+(?:[.,]\d+)?)\s*(.*)$/;

export function parseAmount(raw: string): ParsedAmount {
  const trimmed = raw.trim();
  const m = trimmed.match(LEADING_NUMBER);
  if (!m) {
    return { quantity: null, unit: null, raw: trimmed };
  }
  const quantity = parseFloat(m[1].replace(",", "."));
  if (!Number.isFinite(quantity)) {
    return { quantity: null, unit: null, raw: trimmed };
  }
  return { quantity, unit: m[2].trim(), raw: trimmed };
}

/** Deutsche Zahlausgabe: 1.5 -> "1,5", 2 -> "2", 0.25 -> "0,25". */
export function formatQuantity(value: number): string {
  return Number(value.toFixed(3)).toString().replace(".", ",");
}

/**
 * Skaliert eine Mengenangabe um einen Faktor (z. B. Portionen verdoppeln).
 * Nur wenn eine Zahl erkannt wurde; sonst bleibt der String unverändert.
 */
export function scaleAmount(raw: string, factor: number): string {
  const { quantity, unit } = parseAmount(raw);
  if (quantity === null) return raw.trim();
  const scaled = formatQuantity(quantity * factor);
  return unit ? `${scaled} ${unit}` : scaled;
}
