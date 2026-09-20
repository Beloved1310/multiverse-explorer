import { describe, expect, it } from "vitest";
import type { Location } from "@/features/locations/domain/location";
import { groupLocationsByDimension } from "@/features/locations/domain/group-locations-by-dimension";

function location(id: string, dimension: string): Location {
  return {
    id,
    name: `Location ${id}`,
    type: "Planet",
    dimension,
    residentCount: 0,
  };
}

describe("groupLocationsByDimension", () => {
  it("groups by dimension, sorted alphabetically", () => {
    const groups = groupLocationsByDimension([
      location("1", "Replacement Dimension"),
      location("2", "C-137"),
      location("3", "C-137"),
    ]);

    expect(groups.map(({ dimension }) => dimension)).toEqual([
      "C-137",
      "Replacement Dimension",
    ]);
    expect(groups[0]?.locations.map(({ id }) => id)).toEqual(["2", "3"]);
    expect(groups[1]?.locations.map(({ id }) => id)).toEqual(["1"]);
  });

  it("keeps each group's locations in their incoming order", () => {
    const groups = groupLocationsByDimension([
      location("3", "C-137"),
      location("1", "C-137"),
      location("2", "C-137"),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.locations.map(({ id }) => id)).toEqual(["3", "1", "2"]);
  });

  it("sorts the Unknown dimension last regardless of the other names", () => {
    const groups = groupLocationsByDimension([
      location("1", "Unknown"),
      location("2", "Zeta 7"),
      location("3", "Abadango"),
    ]);

    expect(groups.map(({ dimension }) => dimension)).toEqual([
      "Abadango",
      "Zeta 7",
      "Unknown",
    ]);
  });
});
