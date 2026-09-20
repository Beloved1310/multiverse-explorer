import { describe, expect, it } from "vitest";
import { pluralize } from "@/lib/pluralize";

describe("pluralize", () => {
  it("returns the singular noun for a count of exactly 1", () => {
    expect(pluralize("resident", 1)).toBe("resident");
  });

  it("returns the plural noun for a count of 0", () => {
    expect(pluralize("resident", 0)).toBe("residents");
  });

  it("returns the plural noun for a count greater than 1", () => {
    expect(pluralize("resident", 42)).toBe("residents");
  });
});
