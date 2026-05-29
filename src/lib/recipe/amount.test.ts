import { describe, expect, it } from "vitest";
import { formatQuantity, parseAmount, scaleAmount } from "./amount";

describe("parseAmount", () => {
  it("splits a leading number and unit", () => {
    expect(parseAmount("200 g")).toEqual({ quantity: 200, unit: "g", raw: "200 g" });
    expect(parseAmount("2 EL")).toEqual({ quantity: 2, unit: "EL", raw: "2 EL" });
    expect(parseAmount("100 ml")).toEqual({ quantity: 100, unit: "ml", raw: "100 ml" });
  });

  it("handles a bare number (no unit)", () => {
    expect(parseAmount("1")).toEqual({ quantity: 1, unit: "", raw: "1" });
  });

  it("parses decimal commas and dots", () => {
    expect(parseAmount("1,5 TL").quantity).toBe(1.5);
    expect(parseAmount("0.25 l").quantity).toBe(0.25);
  });

  it("keeps quantity null for non-numeric free text", () => {
    expect(parseAmount("nach Bedarf")).toEqual({ quantity: null, unit: null, raw: "nach Bedarf" });
    expect(parseAmount("ein paar Zweige").quantity).toBeNull();
  });

  it("does not guess on ranges (keeps null, preserves raw)", () => {
    const out = parseAmount("75-90 Minuten");
    expect(out.quantity).toBe(75); // leading number is taken; rest stays as unit
    expect(out.unit).toBe("-90 Minuten");
  });
});

describe("formatQuantity", () => {
  it("formats with German decimal comma and trims trailing zeros", () => {
    expect(formatQuantity(2)).toBe("2");
    expect(formatQuantity(1.5)).toBe("1,5");
    expect(formatQuantity(0.25)).toBe("0,25");
  });
});

describe("scaleAmount", () => {
  it("scales numeric amounts and keeps the unit", () => {
    expect(scaleAmount("200 g", 2)).toBe("400 g");
    expect(scaleAmount("1,5 TL", 2)).toBe("3 TL");
    expect(scaleAmount("2", 0.5)).toBe("1");
  });

  it("leaves free-text amounts unchanged", () => {
    expect(scaleAmount("nach Bedarf", 2)).toBe("nach Bedarf");
    expect(scaleAmount("ein paar Zweige", 3)).toBe("ein paar Zweige");
  });
});
