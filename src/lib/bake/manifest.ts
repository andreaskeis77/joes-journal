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
