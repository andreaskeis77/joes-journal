/**
 * E1.4 - Verfeinert Collection-Meta (Display-Templates) auf BESTEHENDEN
 * Collections.
 *
 * Hintergrund: `schema:apply` ist bewusst additiv (legt nur fehlende
 * Felder/Collections an) und aendert deshalb KEINE Meta bestehender
 * Collections. Display-Template-Verbesserungen brauchen daher diesen
 * expliziten Update-Schritt. Idempotent: setzt die gewuenschten Werte bei jedem
 * Lauf (kein Diff noetig).
 *
 * Usage:  pnpm meta:refine   (Directus muss laufen, .env mit ADMIN_*)
 */
import { updateCollection } from "@directus/sdk";
import { authenticatedClient, type Client } from "./client.js";

/** collection -> Display-Template (was die Listen-/Referenzanzeige zeigt). */
const DISPLAY_TEMPLATES: Record<string, string> = {
  restaurants: "{{name}} - {{city}} ({{status}})",
  restaurant_reviews: "{{title}} - {{rating}}",
  articles: "{{title}} ({{status}})",
  recipes: "{{title}} - {{difficulty}}",
  cocktails: "{{name}} ({{type}})",
  equipment: "{{name}} - {{category}}",
  content_collections: "{{title}}",
  links: "{{label}}",
};

async function refine(client: Client, collection: string, displayTemplate: string) {
  await client.request(
    updateCollection(collection, {
      meta: { display_template: displayTemplate },
    } as never),
  );
  console.log(`[meta] ${collection}: display_template = "${displayTemplate}"`);
}

async function main() {
  console.log("[meta] connecting to Directus...");
  const client = await authenticatedClient();
  console.log("[meta] authenticated.");

  for (const [collection, template] of Object.entries(DISPLAY_TEMPLATES)) {
    try {
      await refine(client, collection, template);
    } catch (error) {
      const message = (error as { message?: string }).message ?? String(error);
      console.warn(`[meta] ${collection}: uebersprungen (${message})`);
    }
  }

  console.log("[meta] done.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[meta] failed:", error);
    process.exit(1);
  });
