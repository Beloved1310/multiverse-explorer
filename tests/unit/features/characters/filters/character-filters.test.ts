import { describe, expect, it } from "vitest";
import {
  buildCharacterFiltersSearchParams,
  countActiveFilters,
  parseCharacterFiltersFromSearchParams,
  toGraphQLCharacterFilter,
} from "@/features/characters/filters/character-filters";

describe("parseCharacterFiltersFromSearchParams", () => {
  it("parses a complete, valid set of filters", () => {
    const params = new URLSearchParams(
      "name=rick&status=alive&species=Human&gender=male",
    );
    expect(parseCharacterFiltersFromSearchParams(params)).toEqual({
      name: "rick",
      status: "alive",
      species: "Human",
      gender: "male",
    });
  });

  it("defaults every field to an empty string when absent", () => {
    const params = new URLSearchParams("");
    expect(parseCharacterFiltersFromSearchParams(params)).toEqual({
      name: "",
      status: "",
      species: "",
      gender: "",
    });
  });

  it("ignores an unknown status value instead of breaking", () => {
    const params = new URLSearchParams("status=zombie");
    expect(parseCharacterFiltersFromSearchParams(params).status).toBe("");
  });

  it("ignores an unknown gender value instead of breaking", () => {
    const params = new URLSearchParams("gender=alien");
    expect(parseCharacterFiltersFromSearchParams(params).gender).toBe("");
  });

  it("ignores an unknown species value instead of breaking", () => {
    const params = new URLSearchParams("species=Wizard");
    expect(parseCharacterFiltersFromSearchParams(params).species).toBe("");
  });

  it("matches status/species case-insensitively and normalises casing", () => {
    const params = new URLSearchParams("status=ALIVE&species=human");
    const filters = parseCharacterFiltersFromSearchParams(params);
    expect(filters.status).toBe("alive");
    expect(filters.species).toBe("Human");
  });

  it("trims whitespace from the name filter", () => {
    const params = new URLSearchParams(
      `name=${encodeURIComponent("  rick  ")}`,
    );
    expect(parseCharacterFiltersFromSearchParams(params).name).toBe("rick");
  });
});

describe("buildCharacterFiltersSearchParams", () => {
  it("includes only the filters that are set", () => {
    const params = buildCharacterFiltersSearchParams({
      name: "rick",
      status: "",
      species: "",
      gender: "",
    });
    expect(params.toString()).toBe("name=rick");
  });

  it("omits every param when all filters are empty", () => {
    const params = buildCharacterFiltersSearchParams({
      name: "",
      status: "",
      species: "",
      gender: "",
    });
    expect(params.toString()).toBe("");
  });

  it("includes every filter when all are set", () => {
    const params = buildCharacterFiltersSearchParams({
      name: "rick",
      status: "alive",
      species: "Human",
      gender: "male",
    });
    expect(params.get("name")).toBe("rick");
    expect(params.get("status")).toBe("alive");
    expect(params.get("species")).toBe("Human");
    expect(params.get("gender")).toBe("male");
  });
});

describe("toGraphQLCharacterFilter", () => {
  it("returns undefined when no filters are active", () => {
    expect(
      toGraphQLCharacterFilter({
        name: "",
        status: "",
        species: "",
        gender: "",
      }),
    ).toBeUndefined();
  });

  it("omits empty fields from the filter object", () => {
    expect(
      toGraphQLCharacterFilter({
        name: "rick",
        status: "",
        species: "",
        gender: "",
      }),
    ).toEqual({ name: "rick" });
  });
});

describe("countActiveFilters", () => {
  it("counts zero when nothing is set", () => {
    expect(
      countActiveFilters({ name: "", status: "", species: "", gender: "" }),
    ).toBe(0);
  });

  it("counts each non-empty field", () => {
    expect(
      countActiveFilters({
        name: "rick",
        status: "alive",
        species: "",
        gender: "",
      }),
    ).toBe(2);
  });
});
