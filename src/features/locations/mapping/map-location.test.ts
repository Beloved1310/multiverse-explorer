import { describe, expect, it } from "vitest";
import { mapLocation, type ApiLocation } from "./map-location";

function buildApiLocation(overrides: Partial<ApiLocation> = {}): ApiLocation {
  return {
    id: "1",
    name: "Earth (C-137)",
    type: "Planet",
    dimension: "Dimension C-137",
    residents: [
      { id: "1", name: "Rick Sanchez" },
      { id: "2", name: "Morty Smith" },
    ],
    ...overrides,
  };
}

describe("mapLocation", () => {
  it("maps a complete record", () => {
    const location = mapLocation(buildApiLocation());

    expect(location).toEqual({
      id: "1",
      name: "Earth (C-137)",
      type: "Planet",
      dimension: "Dimension C-137",
      residents: [
        { id: "1", name: "Rick Sanchez" },
        { id: "2", name: "Morty Smith" },
      ],
    });
  });

  it("falls back to safe defaults for missing optional fields", () => {
    const location = mapLocation(
      buildApiLocation({ type: null, dimension: null, residents: [] }),
    );

    expect(location.type).toBe("Unknown");
    expect(location.dimension).toBe("Unknown");
    expect(location.residents).toEqual([]);
  });

  it("handles null nested resident entries without throwing", () => {
    const location = mapLocation(
      buildApiLocation({
        residents: [null, { id: "3", name: null }],
      }),
    );

    // the null resident is dropped; a resident with a null name falls back to "Unknown"
    expect(location.residents).toEqual([{ id: "3", name: "Unknown" }]);
  });
});
