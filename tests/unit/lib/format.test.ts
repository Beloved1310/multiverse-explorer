import { describe, expect, it } from "vitest";
import { formatNumber } from "@/lib/format";

describe("formatNumber", () => {
  it("formats small numbers with no separator", () => {
    expect(formatNumber(42)).toBe("42");
  });

  it("formats thousands with a comma separator (en-GB)", () => {
    expect(formatNumber(1234)).toBe("1,234");
  });

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
});
