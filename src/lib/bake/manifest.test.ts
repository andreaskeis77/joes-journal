import { describe, expect, it } from "vitest";
import { resolveImage, type UploadsManifest } from "./manifest";

const manifest: UploadsManifest = {
  "11111111-1111-1111-1111-111111111111": "/_uploads/11111111-1111-1111-1111-111111111111.webp",
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
