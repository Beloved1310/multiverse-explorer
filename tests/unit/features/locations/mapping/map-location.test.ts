import { describe, expect, it } from "vitest";
import {
  mapLocation,
  type ApiLocation,
} from "@/features/locations/mapping/map-location";

function buildApiLocation(overrides: Partial<ApiLocation> = {}): ApiLocation {
  return {
    id: "1",
    name: "Earth (C-137)",
    type: "Planet",
    dimension: "Dimension C-137",
    residents: [{ id: "1" }, { id: "2" }],
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
      residentCount: 2,
    });
  });

  it("falls back to safe defaults for missing optional fields", () => {
    const location = mapLocation(
      buildApiLocation({ type: null, dimension: null, residents: [] }),
    );

    expect(location.type).toBe("Unknown");
    expect(location.dimension).toBe("Unknown");
    expect(location.residentCount).toBe(0);
  });

  it("drops null resident entries when counting residents", () => {
    const location = mapLocation(
      buildApiLocation({ residents: [null, { id: "3" }] }),
    );

    expect(location.residentCount).toBe(1);
  });
});
