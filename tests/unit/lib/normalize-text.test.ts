import { describe, expect, it } from "vitest";
import { normalizeText, UNKNOWN_VALUE } from "@/lib/normalize-text";

describe("normalizeText", () => {
  it("returns the value unchanged when it's a real, non-empty string", () => {
    expect(normalizeText("Earth (C-137)")).toBe("Earth (C-137)");
  });

  it("falls back to Unknown for null", () => {
    expect(normalizeText(null)).toBe(UNKNOWN_VALUE);
  });

  it("falls back to Unknown for undefined", () => {
    expect(normalizeText(undefined)).toBe(UNKNOWN_VALUE);
  });

  it("falls back to Unknown for an empty or whitespace-only string", () => {
    expect(normalizeText("")).toBe(UNKNOWN_VALUE);
    expect(normalizeText("   ")).toBe(UNKNOWN_VALUE);
  });

  it("normalizes the API's own literal lowercase 'unknown' sentinel to 'Unknown'", () => {
    expect(normalizeText("unknown")).toBe(UNKNOWN_VALUE);
    expect(normalizeText("Unknown")).toBe(UNKNOWN_VALUE);
    expect(normalizeText("UNKNOWN")).toBe(UNKNOWN_VALUE);
  });

  it("does not touch a real value that merely contains the word 'unknown'", () => {
    expect(normalizeText("Unknown Dimension")).toBe("Unknown Dimension");
  });
});
