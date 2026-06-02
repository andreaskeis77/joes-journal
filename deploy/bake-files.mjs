#!/usr/bin/env node
/**
 * E1.3 - Build-time "bake" of Directus Files into the static output.
 *
 * Downloads Directus files referenced by PUBLISHED content into
 * public/_uploads/ and writes the id->local-URL map to
 * src/data/uploads-manifest.json. Runs BEFORE `astro build` (see rebuild.ps1).
 *
 * Why bake instead of runtime URLs: the static frontend serves files itself and
 * Directus sits behind Cloudflare Access; a runtime /assets/<id> URL would be
 * auth-protected -> broken images. Baking keeps the site static AND private.
 *
 * SEC-1: only files referenced by published reviews/articles (and the
 * always-public restaurants/recipes/cocktails/equipment) are baked, so an
 * unpublished upload never lands in the public directory.
 *
 * No secrets in code: credentials come from the gitignored repo-root .env
 * (or the environment). Exits 0 (no-op) when credentials are absent, so a
 * stub-only environment can run it harmlessly.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { authentication, createDirectus, readFiles, readItems, rest } from "@directus/sdk";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(repoRoot, "public", "_uploads");
const manifestPath = join(repoRoot, "src", "data", "uploads-manifest.json");

/** Collections with a hero/card image; `published` ones honor the SEC-1 gate. */
const MEDIA = [
  { collection: "restaurants", published: false },
  { collection: "restaurant_reviews", published: true },
  { collection: "articles", published: true },
  { collection: "recipes", published: false },
  { collection: "cocktails", published: false },
  { collection: "equipment", published: false },
];

const EXT_BY_TYPE = {
  "image/webp": ".webp",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

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

function extFor(file) {
  const name = file?.filename_download;
  if (name && name.includes(".")) return name.slice(name.lastIndexOf("."));
  return EXT_BY_TYPE[file?.type] ?? ".bin";
}

async function main() {
  const env = loadEnv();
  const url = env.JOES_DIRECTUS_URL || "http://127.0.0.1:8055";
  const email = env.JOES_DIRECTUS_EMAIL;
  const password = env.JOES_DIRECTUS_PASSWORD;

  if (!email || !password) {
    console.log("[bake] JOES_DIRECTUS_EMAIL/PASSWORD fehlen - kein Bake (no-op).");
    process.exit(0);
  }

  const client = createDirectus(url).with(authentication()).with(rest());
  await client.login(email, password);

  // 1) collect referenced file ids from published content
  const fileIds = new Set();
  for (const { collection, published } of MEDIA) {
    const query = { limit: -1, fields: ["image_file"] };
    if (published) query.filter = { status: { _eq: "published" } };
    try {
      const items = await client.request(readItems(collection, query));
      for (const it of items) if (it?.image_file) fileIds.add(it.image_file);
    } catch {
      console.warn(
        `[bake] ${collection}: image_file nicht lesbar (Feld evtl. noch nicht da) - skip.`,
      );
    }
  }

  // 1b) Phase 2: inline body images of PUBLISHED articles (SEC-1: nur published
  //     Bodies werden gescannt). Findet jede /assets/<uuid>-Referenz im
  //     WYSIWYG-HTML und reiht sie in dieselbe fileIds-Menge ein; die
  //     Download-Schleife unten laedt sie unveraendert mit.
  const ASSET_RE = /\/assets\/([0-9a-f-]{36})/gi;
  try {
    const arts = await client.request(
      readItems("articles", {
        limit: -1,
        fields: ["body"],
        filter: { status: { _eq: "published" } },
      }),
    );
    for (const a of arts) {
      if (typeof a?.body !== "string") continue;
      for (const m of a.body.matchAll(ASSET_RE)) fileIds.add(m[1]);
    }
  } catch {
    console.warn("[bake] articles.body inline-Scan uebersprungen (Feld evtl. noch nicht da).");
  }

  // 2) download each into public/_uploads/ and build the manifest
  mkdirSync(outDir, { recursive: true });
  const manifest = {};
  let downloaded = 0;
  const token = await client.getToken();
  for (const id of fileIds) {
    let meta = [];
    try {
      meta = await client.request(
        readFiles({
          filter: { id: { _eq: id } },
          fields: ["id", "type", "filename_download"],
          limit: 1,
        }),
      );
    } catch {
      meta = [];
    }
    const localName = `${id}${extFor(meta[0])}`;
    const res = await fetch(`${url}/assets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.warn(`[bake] asset ${id}: HTTP ${res.status} - skip.`);
      continue;
    }
    writeFileSync(join(outDir, localName), Buffer.from(await res.arrayBuffer()));
    manifest[id] = `/_uploads/${localName}`;
    downloaded++;
  }

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(
    `[bake] ${downloaded} Datei(en) nach public/_uploads/; Manifest: ${Object.keys(manifest).length} Eintraege.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[bake] Fehler:", error);
    process.exit(1);
  });
