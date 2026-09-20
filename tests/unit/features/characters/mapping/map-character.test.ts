import { describe, expect, it } from "vitest";
import {
  mapCharacter,
  type ApiCharacter,
} from "@/features/characters/mapping/map-character";

function buildApiCharacter(
  overrides: Partial<ApiCharacter> = {},
): ApiCharacter {
  return {
    id: "1",
    name: "Rick Sanchez",
    image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
    status: "Alive",
    species: "Human",
    gender: "Male",
    origin: { name: "Earth (C-137)" },
    location: { name: "Citadel of Ricks" },
    episode: [{ name: "Pilot" }, { name: "Lawnmower Dog" }],
    ...overrides,
  };
}

describe("mapCharacter", () => {
  it("maps a complete record", () => {
    const character = mapCharacter(buildApiCharacter());

    expect(character).toEqual({
      id: "1",
      name: "Rick Sanchez",
      imageUrl: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
      status: "alive",
      species: "Human",
      gender: "male",
      origin: "Earth (C-137)",
      location: "Citadel of Ricks",
      episodes: ["Pilot", "Lawnmower Dog"],
    });
  });

  it("falls back to safe defaults for missing optional fields", () => {
    const character = mapCharacter(
      buildApiCharacter({
        name: null,
        image: null,
        species: null,
        gender: null,
        episode: [],
      }),
    );

    expect(character.name).toBe("Unknown");
    expect(character.imageUrl).toBe("");
    expect(character.species).toBe("Unknown");
    expect(character.gender).toBe("unknown");
    expect(character.episodes).toEqual([]);
  });

  it("handles null nested objects without throwing", () => {
    const character = mapCharacter(
      buildApiCharacter({
        origin: null,
        location: null,
        episode: [null, { name: "Pilot" }, { name: null }],
      }),
    );

    expect(character.origin).toBe("Unknown");
    expect(character.location).toBe("Unknown");
    // null episode entries are dropped; an episode with a null name falls back to "Unknown"
    expect(character.episodes).toEqual(["Pilot", "Unknown"]);
  });

  it("normalises an unexpected status value to 'unknown'", () => {
    const character = mapCharacter(buildApiCharacter({ status: "Zombie" }));

    expect(character.status).toBe("unknown");
  });

  it("normalises a null status to 'unknown'", () => {
    const character = mapCharacter(buildApiCharacter({ status: null }));

    expect(character.status).toBe("unknown");
  });

  it("handles a genuinely absent episode field without throwing (returnPartialData)", () => {
    // mapCharacter is reused for location residents and episode casts,
    // both of which enable returnPartialData -- this simulates a
    // resident/cast member arriving before its episode field has loaded.
    const { episode, ...partialCharacter } = buildApiCharacter();
    void episode; // intentionally discarded -- that's the point of this fixture

    expect(() => mapCharacter(partialCharacter)).not.toThrow();
    expect(mapCharacter(partialCharacter).episodes).toEqual([]);
  });
});
