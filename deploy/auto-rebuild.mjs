#!/usr/bin/env node
/**
 * Robuster Auto-Rebuild (Ersatz fuer den fragilen Directus-Flow + Webhook + Token).
 *
 * Laeuft als geplanter Task alle paar Minuten, fragt Directus nach der JUENGSTEN
 * INHALTS-Aenderung (directus_activity) und startet deploy/rebuild.ps1 NUR, wenn
 * sich seit dem letzten erfolgreichen Build etwas geaendert hat.
 *
 * Warum so (idiotensicher):
 *  - KEIN Directus-Flow (kann "verschwinden", wenn nicht gespeichert), KEIN
 *    Webhook, KEIN offener Port, KEIN Shared-Secret-Token. Nichts, das verkleben
 *    oder verloren gehen kann.
 *  - Nutzt dieselben Directus-Zugangsdaten wie der Build (JOES_DIRECTUS_*) - die
 *    sind nachweislich korrekt, weil der Build damit Inhalte zieht.
 *  - Selbstheilend: bei Build-Erfolg wird der Zeitstempel fortgeschrieben, bei
 *    Fehler NICHT -> der naechste Lauf versucht es erneut.
 *  - rebuild.ps1 ist atomar (altes dist/ bleibt bei Fehler) -> nie leere Seite.
 *  - Ueberlappung verhindert der Task selbst (MultipleInstances IgnoreNew).
 *
 * Zustand: <repo>/../state/auto-rebuild.json (AUSSERHALB des Repos, damit ein
 * spaeteres git pull es nie anfasst). Erster Lauf ohne Zustand -> einmal bauen.
 *
 * Manueller Test:  node deploy/auto-rebuild.mjs
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { authentication, createDirectus, readActivities, rest } from "@directus/sdk";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const stateDir = join(repoRoot, "..", "state");
const statePath = join(stateDir, "auto-rebuild.json");
const rebuildPs1 = join(repoRoot, "deploy", "rebuild.ps1");

/** Inhalts-Collections, deren Aenderung einen Rebuild ausloesen soll. */
const CONTENT_COLLECTIONS = [
  "restaurants",
  "restaurant_reviews",
  "articles",
  "articles_files",
  "recipes",
  "cocktails",
  "equipment",
  "ingredients",
  "suppliers",
  "content_collections",
  "links",
  "tax_cuisines",
  "tax_locations",
  "tax_tags",
  "tax_ingredient_categories",
  "tax_equipment_categories",
  "tax_supplier_types",
];

function loadEnv() {
  const env = { ...process.env };
  const envPath = join(repoRoot, ".env");
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let value = m[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(m[1] in process.env)) env[m[1]] = value;
    }
  }
  return env;
}

function log(msg) {
  console.log(`[auto-rebuild ${new Date().toISOString()}] ${msg}`);
}

function readState() {
  try {
    return JSON.parse(readFileSync(statePath, "utf8"));
  } catch {
    return {};
  }
}

function writeState(lastId, lastChange) {
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(
    statePath,
    JSON.stringify({ lastId, lastChange, lastBuiltAt: new Date().toISOString() }, null, 2) + "\n",
  );
}

/**
 * Juengste INHALTS-Aenderung als {id, timestamp}. `id` von directus_activity ist
 * eine monoton steigende Integer-PK -> wir vergleichen darauf (zeitzonen-
 * unabhaengig, kein DST-Edge). `timestamp` nur fuers Log/den Zustand.
 */
async function latestContentChange(client) {
  const rows = await client.request(
    readActivities({
      filter: {
        action: { _in: ["create", "update", "delete"] },
        collection: { _in: CONTENT_COLLECTIONS },
      },
      sort: ["-id"],
      limit: 1,
      fields: ["id", "timestamp", "collection", "action"],
    }),
  );
  const r = rows[0];
  return r ? { id: r.id, timestamp: r.timestamp } : null;
}

function runRebuild() {
  log("Aenderung erkannt -> starte rebuild.ps1 ...");
  const res = spawnSync(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", rebuildPs1],
    { cwd: repoRoot, stdio: "inherit" },
  );
  return res.status === 0;
}

async function main() {
  const env = loadEnv();
  const url = env.JOES_DIRECTUS_URL || "http://127.0.0.1:8055";
  const email = env.JOES_DIRECTUS_EMAIL;
  const password = env.JOES_DIRECTUS_PASSWORD;
  if (!email || !password) {
    log("JOES_DIRECTUS_EMAIL/PASSWORD fehlen in .env - Abbruch (kein Rebuild).");
    process.exit(0);
  }

  const client = createDirectus(url).with(authentication()).with(rest());
  await client.login(email, password);

  let latest;
  try {
    latest = await latestContentChange(client);
  } catch (error) {
    const m = error?.errors?.[0]?.message ?? error?.message ?? String(error);
    log(`directus_activity nicht lesbar - kein Auto-Rebuild (naechtlicher Task greift). (${m})`);
    process.exit(0);
  }

  const state = readState();
  const hasState = typeof state.lastId === "number";
  const lastId = hasState ? state.lastId : -1;

  let need;
  if (!hasState) {
    need = true;
    log("Erstlauf (kein Zustand) -> Baseline-Build.");
  } else if (latest && latest.id > lastId) {
    need = true;
    log(`Neue Aenderung: activity #${latest.id} @ ${latest.timestamp} (zuletzt #${lastId}).`);
  } else {
    need = false;
  }

  if (!need) {
    log(`Keine neue Aenderung (zuletzt #${lastId}) - kein Build.`);
    process.exit(0);
  }

  if (runRebuild()) {
    // Bei leerem Activity-Log (latest null) auf erstem Lauf: 0 als Baseline merken.
    writeState(latest?.id ?? (hasState ? lastId : 0), latest?.timestamp ?? null);
    log("Rebuild erfolgreich, Zustand fortgeschrieben.");
    process.exit(0);
  }
  log("Rebuild FEHLGESCHLAGEN - Zustand NICHT fortgeschrieben (Retry beim naechsten Lauf).");
  process.exit(1);
}

main().catch((error) => {
  console.error("[auto-rebuild] Fehler:", error);
  process.exit(1);
});
