import { describe, expect, it } from "vitest";
import { resolveImage, rewriteBodyAssets, resolveGallery, type UploadsManifest } from "./manifest";

const UUID = "11111111-1111-1111-1111-111111111111";
const manifest: UploadsManifest = {
  [UUID]: `/_uploads/${UUID}.webp`,
};

describe("resolveImage", () => {
  it("returns the baked local URL when the file reference is in the manifest", () => {
    expect(resolveImage("/assets/old.webp", "11111111-1111-1111-1111-111111111111", manifest)).toBe(
      "/_uploads/11111111-1111-1111-1111-111111111111.webp",
    );
  });

  it("falls back to the string path when there is no file reference", () => {
    expect(resolveImage("/assets/old.webp", null, manifest)).toBe("/assets/old.webp");
    expect(resolveImage("/assets/old.webp", undefined, manifest)).toBe("/assets/old.webp");
  });

  it("falls back to the string path when the file was not baked into the manifest", () => {
    expect(resolveImage("/assets/old.webp", "unknown-uuid", manifest)).toBe("/assets/old.webp");
  });

  it("returns empty string when neither a baked file nor a path is available", () => {
    expect(resolveImage(null, null, manifest)).toBe("");
    expect(resolveImage(undefined, "unknown-uuid", manifest)).toBe("");
  });
});

describe("rewriteBodyAssets", () => {
  it("rewrites an absolute /assets/<uuid> URL (with host + query) to the local path", () => {
    const body = `<p>Foto:</p><img src="http://127.0.0.1:8055/assets/${UUID}.webp?width=800" alt="x">`;
    const out = rewriteBodyAssets(body, manifest);
    expect(out).toContain(`src="/_uploads/${UUID}.webp"`);
    expect(out).not.toContain("/assets/");
    expect(out).not.toContain("127.0.0.1");
  });

  it("rewrites a relative /assets/<uuid> URL without an extension", () => {
    expect(rewriteBodyAssets(`<img src="/assets/${UUID}">`, manifest)).toBe(
      `<img src="/_uploads/${UUID}.webp">`,
    );
  });

  it("leaves an unbaked asset URL untouched", () => {
    const other = "22222222-2222-2222-2222-222222222222";
    const body = `<img src="/assets/${other}.webp">`;
    expect(rewriteBodyAssets(body, manifest)).toBe(body);
  });

  it("handles empty/plain bodies without changes", () => {
    expect(rewriteBodyAssets("", manifest)).toBe("");
    expect(rewriteBodyAssets("<p>Nur Text, kein Bild.</p>", manifest)).toBe(
      "<p>Nur Text, kein Bild.</p>",
    );
  });
});

describe("resolveGallery", () => {
  const fallback = ["/assets/old-gallery.webp"];

  it("maps baked file UUIDs to their local _uploads paths", () => {
    expect(resolveGallery([UUID], fallback, manifest)).toEqual([`/_uploads/${UUID}.webp`]);
  });

  it("drops unbaked/null ids and keeps only resolved files", () => {
    expect(resolveGallery([UUID, "unbaked", null], fallback, manifest)).toEqual([
      `/_uploads/${UUID}.webp`,
    ]);
  });

  it("falls back to the legacy string paths when no file is baked", () => {
    expect(resolveGallery([], fallback, manifest)).toEqual(fallback);
    expect(resolveGallery(null, fallback, manifest)).toEqual(fallback);
    expect(resolveGallery(["unbaked"], fallback, manifest)).toEqual(fallback);
  });
});
