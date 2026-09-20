import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/db", () => ({ db: {} }));

import {
  normaliseSavedFilter,
  SavedFilterValidationError,
} from "@/server/saved-filters/service";

const validInput = {
  name: "  C-137 survivors ",
  filter: {
    statuses: ["Alive", "alive"],
    dimension: " C-137 ",
    sort: { field: "EPISODE_COUNT" as const, direction: "DESC" as const },
  },
};

describe("saved-filter validation", () => {
  it("normalises a valid filter before it reaches PostgreSQL", () => {
    expect(normaliseSavedFilter(validInput)).toEqual({
      name: "C-137 survivors",
      filter: {
        name: "",
        statuses: ["alive"],
        species: "",
        gender: "",
        dimension: "C-137",
        minEpisodes: null,
        sort: { field: "EPISODE_COUNT", direction: "DESC" },
      },
    });
  });

  it.each([
    ["a blank saved-search name", { ...validInput, name: "   " }],
    ["an empty filter", { name: "Empty", filter: {} }],
    ["an unsupported status", { name: "Bad", filter: { statuses: ["gone"] } }],
    [
      "a fractional episode count",
      { name: "Bad", filter: { minEpisodes: 1.5 } },
    ],
    [
      "an out-of-range episode count",
      { name: "Bad", filter: { minEpisodes: 1001 } },
    ],
  ])("rejects %s", (_, input) => {
    expect(() => normaliseSavedFilter(input)).toThrow(
      SavedFilterValidationError,
    );
  });
});
