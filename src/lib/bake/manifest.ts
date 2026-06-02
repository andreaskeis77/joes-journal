/**
 * Build-time "bake" of Directus Files into the static output.
 *
 * Rationale: the frontend is a static site and Directus sits behind Cloudflare
 * Access. A runtime `/assets/<id>` URL would be auth-protected → broken images.
 * Instead, a pre-build step (deploy/bake-files.mjs) downloads referenced
 * Directus files into `public/_uploads/` and writes the id→local-URL map below.
 * The loader resolves file references against this manifest at build time, so
 * the published site only ever serves local assets. See docs/MEDIA_BAKE.md.
 *
 * The manifest is a generated artifact: it ships as `{}` in the repo (no baked
 * files → everything falls back to the plain string path) and is overwritten by
 * the bake step before each Directus-mode build.
 */
export type UploadsManifest = Record<string, string>;

/**
 * Resolves the effective image URL for a content item.
 *
 * Preference order: a baked Directus file (when a file reference exists AND it
 * was downloaded into the manifest) wins over the legacy string path. If there
 * is no file reference or it was not baked, the existing string path is used
 * unchanged — making the file field a fully additive, backward-compatible
 * enhancement (Decision Log #3: hybrid — curated assets stay in public/,
 * uploaded photos come via Files + bake).
 */
export function resolveImage(
  stringPath: string | null | undefined,
  fileId: string | null | undefined,
  manifest: UploadsManifest,
): string {
  if (fileId && manifest[fileId]) {
    return manifest[fileId];
  }
  return stringPath ?? "";
}

/**
 * Matches a Directus asset URL inside WYSIWYG body HTML and captures its file
 * UUID. Tolerates an optional scheme+host prefix (e.g. http://127.0.0.1:8055)
 * and any trailing filename/query (e.g. `<uuid>.webp?width=800`), stopping at a
 * quote, whitespace, `)` or `<`.
 */
const ASSET_URL_RE = /(?:https?:\/\/[^/"'\s]+)?\/assets\/([0-9a-f-]{36})[^"'\s)<]*/gi;

/**
 * E1.3/Phase 2 – ersetzt in einem WYSIWYG-Body jede Directus-Asset-URL durch den
 * lokal gebackenen `/_uploads/`-Pfad aus dem Manifest. Notwendig, weil
 * `/assets/<id>` öffentlich hinter Cloudflare Access liegt (kaputtes Bild).
 * Nicht gebackene Referenzen bleiben unverändert (defensiver Fallback).
 */
export function rewriteBodyAssets(body: string, manifest: UploadsManifest): string {
  if (!body) return body;
  return body.replace(ASSET_URL_RE, (whole, id: string) => manifest[id] ?? whole);
}
