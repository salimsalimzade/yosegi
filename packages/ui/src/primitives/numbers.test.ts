import { describe, expect, it } from "vitest";
import { parseNumber } from "./numbers";

describe("parseNumber", () => {
  it("reads the locale's group and decimal marks", () => {
    expect(parseNumber("1,234.5", "en-US")).toBe(1234.5);
    expect(parseNumber("1.234,5", "de-DE")).toBe(1234.5);
    expect(parseNumber("1 234,5", "fr-FR")).toBe(1234.5);
    expect(parseNumber("1 234,5", "fr-FR")).toBe(1234.5);
  });

  it("drops everything that isn't part of the number", () => {
    expect(parseNumber("$1,200", "en-US")).toBe(1200);
    expect(parseNumber("  42 ", "en-US")).toBe(42);
  });

  it("keeps the sign", () => {
    expect(parseNumber("-3.5", "en-US")).toBe(-3.5);
  });

  it("is NaN when no number is left", () => {
    expect(parseNumber("", "en-US")).toBeNaN();
    expect(parseNumber("-", "en-US")).toBeNaN();
    expect(parseNumber("abc", "en-US")).toBeNaN();
  });
});
