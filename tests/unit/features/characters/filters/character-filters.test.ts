import { describe, expect, it } from "vitest";
import {
  buildCharacterFiltersSearchParams,
  countActiveFilters,
  parseCharacterFiltersFromSearchParams,
  toGraphQLCharacterFilter,
  toGraphQLCharacterSort,
} from "@/features/characters/filters/character-filters";

describe("parseCharacterFiltersFromSearchParams", () => {
  it("reads multi-select statuses and the BFF filters from the URL", () => {
    const filters = parseCharacterFiltersFromSearchParams(
      new URLSearchParams(
        "name=rick&status=alive&status=unknown&species=Human&gender=male&dimension=C-137&minEpisodes=11&sort=episodes-desc",
      ),
    );

    expect(filters).toEqual({
      name: "rick",
      statuses: ["alive", "unknown"],
      species: "Human",
      gender: "male",
      dimension: "C-137",
      minEpisodes: "11",
      sort: "episodes-desc",
    });
  });

  it("rejects invalid values and uses the default sort", () => {
    const filters = parseCharacterFiltersFromSearchParams(
      new URLSearchParams("status=zombie&minEpisodes=-1&sort=random"),
    );

    expect(filters.statuses).toEqual([]);
    expect(filters.minEpisodes).toBe("");
    expect(filters.sort).toBe("name-asc");
  });
});

describe("buildCharacterFiltersSearchParams", () => {
  it("uses repeatable status parameters and omits the default sort", () => {
    const params = buildCharacterFiltersSearchParams({
      name: "rick",
      statuses: ["alive", "unknown"],
      sort: "name-asc",
    });

    expect(params.toString()).toBe("name=rick&status=alive&status=unknown");
  });
});

describe("GraphQL conversions", () => {
  it("maps rich URL filters to the BFF input", () => {
    expect(
      toGraphQLCharacterFilter({
        name: "rick",
        statuses: ["alive", "unknown"],
        species: "",
        gender: "",
        dimension: "C-137",
        minEpisodes: "11",
        sort: "episodes-desc",
      }),
    ).toEqual({
      name: "rick",
      statuses: ["alive", "unknown"],
      dimension: "C-137",
      minEpisodes: 11,
    });
    expect(toGraphQLCharacterSort("episodes-desc")).toEqual({
      field: "EPISODE_COUNT",
      direction: "DESC",
    });
  });
});

describe("countActiveFilters", () => {
  it("counts status selections as one filter and excludes sort", () => {
    expect(
      countActiveFilters({
        name: "",
        statuses: ["alive", "unknown"],
        species: "",
        gender: "",
        dimension: "C-137",
        minEpisodes: "",
        sort: "episodes-desc",
      }),
    ).toBe(2);
  });
});
