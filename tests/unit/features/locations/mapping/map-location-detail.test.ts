import { describe, expect, it } from "vitest";
import {
  mapLocationDetail,
  type ApiLocationDetail,
} from "@/features/locations/mapping/map-location-detail";

function buildApiLocationDetail(
  overrides: Partial<ApiLocationDetail> = {},
): ApiLocationDetail {
  return {
    id: "1",
    name: "Earth (C-137)",
    type: "Planet",
    dimension: "Dimension C-137",
    residents: [
      {
        id: "1",
        name: "Rick Sanchez",
        image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
        status: "Alive",
        species: "Human",
        gender: "Male",
        origin: { name: "Earth (C-137)" },
        location: { name: "Citadel of Ricks" },
        episode: [{ name: "Pilot" }],
      },
    ],
    ...overrides,
  };
}

describe("mapLocationDetail", () => {
  it("maps a complete record, reusing the character mapper for its residents", () => {
    const location = mapLocationDetail(buildApiLocationDetail());

    expect(location.id).toBe("1");
    expect(location.name).toBe("Earth (C-137)");
    expect(location.type).toBe("Planet");
    expect(location.dimension).toBe("Dimension C-137");
    expect(location.residents).toEqual([
      {
        id: "1",
        name: "Rick Sanchez",
        imageUrl: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
        status: "alive",
        species: "Human",
        gender: "male",
        origin: "Earth (C-137)",
        location: "Citadel of Ricks",
        episodes: ["Pilot"],
      },
    ]);
  });

  it("falls back to safe defaults for missing optional fields", () => {
    const location = mapLocationDetail(
      buildApiLocationDetail({ type: null, dimension: null }),
    );

    expect(location.type).toBe("Unknown");
    expect(location.dimension).toBe("Unknown");
  });

  it("drops null resident entries instead of throwing", () => {
    const location = mapLocationDetail(
      buildApiLocationDetail({
        residents: [null, ...(buildApiLocationDetail().residents ?? [])],
      }),
    );

    expect(location.residents).toHaveLength(1);
  });
});
