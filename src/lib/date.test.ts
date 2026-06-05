import { describe, expect, it } from "vitest";
import { formatGermanDate } from "./date";

describe("formatGermanDate", () => {
  it("formats a valid ISO date in German", () => {
    expect(formatGermanDate("2026-04-18")).toBe("18. April 2026");
  });

  it("honours custom options", () => {
    expect(formatGermanDate("2026-04-18", { year: "numeric", month: "long" })).toBe("April 2026");
  });

  it("returns empty string for empty/null/undefined (no 'Invalid Date')", () => {
    expect(formatGermanDate("")).toBe("");
    expect(formatGermanDate(null)).toBe("");
    expect(formatGermanDate(undefined)).toBe("");
  });

  it("returns empty string for an unparseable date instead of 'Invalid Date'", () => {
    expect(formatGermanDate("not-a-date")).toBe("");
  });
});
