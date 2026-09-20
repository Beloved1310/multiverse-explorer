import { describe, expect, it } from "vitest";
import {
  buildLocationFiltersSearchParams,
  countActiveLocationFilters,
  parseLocationFiltersFromSearchParams,
  toGraphQLLocationFilter,
} from "@/features/locations/filters/location-filters";

describe("parseLocationFiltersFromSearchParams", () => {
  it("parses a complete set of filters", () => {
    const params = new URLSearchParams(
      "name=earth&type=Planet&dimension=C-137",
    );
    expect(parseLocationFiltersFromSearchParams(params)).toEqual({
      name: "earth",
      type: "Planet",
      dimension: "C-137",
    });
  });

  it("defaults every field to an empty string when absent", () => {
    expect(parseLocationFiltersFromSearchParams(new URLSearchParams())).toEqual(
      { name: "", type: "", dimension: "" },
    );
  });

  it("trims whitespace from every field", () => {
    const params = new URLSearchParams(
      `name=${encodeURIComponent("  earth  ")}`,
    );
    expect(parseLocationFiltersFromSearchParams(params).name).toBe("earth");
  });
});

describe("buildLocationFiltersSearchParams", () => {
  it("includes only the filters that are set", () => {
    const params = buildLocationFiltersSearchParams({
      name: "earth",
      type: "",
      dimension: "",
    });
    expect(params.toString()).toBe("name=earth");
  });

  it("omits every param when all filters are empty", () => {
    const params = buildLocationFiltersSearchParams({
      name: "",
      type: "",
      dimension: "",
    });
    expect(params.toString()).toBe("");
  });
});

describe("toGraphQLLocationFilter", () => {
  it("returns undefined when no filters are active", () => {
    expect(
      toGraphQLLocationFilter({ name: "", type: "", dimension: "" }),
    ).toBeUndefined();
  });

  it("includes every filter when all are set", () => {
    expect(
      toGraphQLLocationFilter({
        name: "earth",
        type: "Planet",
        dimension: "C-137",
      }),
    ).toEqual({ name: "earth", type: "Planet", dimension: "C-137" });
  });
});

describe("countActiveLocationFilters", () => {
  it("counts zero when nothing is set", () => {
    expect(
      countActiveLocationFilters({ name: "", type: "", dimension: "" }),
    ).toBe(0);
  });

  it("counts each non-empty field", () => {
    expect(
      countActiveLocationFilters({
        name: "earth",
        type: "Planet",
        dimension: "",
      }),
    ).toBe(2);
  });
});
