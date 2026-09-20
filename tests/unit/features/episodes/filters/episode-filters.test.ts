import { describe, expect, it } from "vitest";
import {
  buildEpisodeFiltersSearchParams,
  countActiveEpisodeFilters,
  parseEpisodeFiltersFromSearchParams,
  toGraphQLEpisodeFilter,
} from "@/features/episodes/filters/episode-filters";

describe("parseEpisodeFiltersFromSearchParams", () => {
  it("parses a complete set of filters", () => {
    const params = new URLSearchParams("name=pilot&code=S01E01");
    expect(parseEpisodeFiltersFromSearchParams(params)).toEqual({
      name: "pilot",
      code: "S01E01",
    });
  });

  it("defaults every field to an empty string when absent", () => {
    expect(parseEpisodeFiltersFromSearchParams(new URLSearchParams())).toEqual({
      name: "",
      code: "",
    });
  });

  it("trims whitespace from both fields", () => {
    const params = new URLSearchParams(
      `name=${encodeURIComponent("  pilot  ")}&code=${encodeURIComponent("  S01E01  ")}`,
    );
    expect(parseEpisodeFiltersFromSearchParams(params)).toEqual({
      name: "pilot",
      code: "S01E01",
    });
  });
});

describe("buildEpisodeFiltersSearchParams", () => {
  it("includes only the filters that are set", () => {
    const params = buildEpisodeFiltersSearchParams({ name: "pilot", code: "" });
    expect(params.toString()).toBe("name=pilot");
  });

  it("omits every param when all filters are empty", () => {
    const params = buildEpisodeFiltersSearchParams({ name: "", code: "" });
    expect(params.toString()).toBe("");
  });
});

describe("toGraphQLEpisodeFilter", () => {
  it("returns undefined when no filters are active", () => {
    expect(toGraphQLEpisodeFilter({ name: "", code: "" })).toBeUndefined();
  });

  it("maps 'code' to the API's 'episode' field", () => {
    expect(toGraphQLEpisodeFilter({ name: "", code: "S01E01" })).toEqual({
      episode: "S01E01",
    });
  });

  it("includes both fields when both are set", () => {
    expect(toGraphQLEpisodeFilter({ name: "pilot", code: "S01E01" })).toEqual({
      name: "pilot",
      episode: "S01E01",
    });
  });
});

describe("countActiveEpisodeFilters", () => {
  it("counts zero when nothing is set", () => {
    expect(countActiveEpisodeFilters({ name: "", code: "" })).toBe(0);
  });

  it("counts each non-empty field", () => {
    expect(countActiveEpisodeFilters({ name: "pilot", code: "S01E01" })).toBe(
      2,
    );
  });
});
