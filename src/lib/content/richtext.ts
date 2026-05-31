/**
 * Sicheres Rendern von WYSIWYG-Artikel-Body (Directus `input-rich-text-html`).
 *
 * Der Body ist HTML aus dem Editor (vertrauenswürdiger Einzel-Autor hinter
 * Cloudflare Access, zur Build-Zeit zu statischem HTML gerendert). Trotzdem
 * wird das HTML mit einer engen Allowlist saniert, bevor es per `set:html`
 * ausgegeben wird – so kann ein versehentlich eingefügtes `<script>` o. Ä. nie
 * in die statische Seite gelangen. Inline-Bilder zeigen nach dem Build auf
 * lokale `/_uploads/`-Pfade (siehe deploy/bake-files.mjs + rewriteBodyAssets).
 */
import sanitizeHtml from "sanitize-html";

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "blockquote",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "figure",
    "figcaption",
    "hr",
    "code",
    "pre",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
  },
  // Links nur über sichere Schemata; Bilder nur über http(s) bzw. relative
  // /_uploads/-Pfade (relative URLs erlaubt sanitize-html standardmäßig).
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  transformTags: {
    // Externe Links absichern.
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
  },
};

/** Saniert WYSIWYG-Artikel-HTML für die Ausgabe via `set:html`. */
export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, OPTIONS);
}
