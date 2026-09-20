import { describe, expect, it } from "vitest";
import {
  mapCharacterDetail,
  type ApiCharacterDetail,
} from "@/features/characters/mapping/map-character-detail";

function buildApiCharacterDetail(
  overrides: Partial<ApiCharacterDetail> = {},
): ApiCharacterDetail {
  return {
    id: "1",
    name: "Rick Sanchez",
    image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
    status: "Alive",
    species: "Human",
    gender: "Male",
    origin: { id: "1", name: "Earth (C-137)" },
    location: { id: "3", name: "Citadel of Ricks" },
    episodeCount: 2,
    episodeSeasons: [{ season: 1, count: 2 }],
    ...overrides,
  };
}

describe("mapCharacterDetail", () => {
  it("maps a complete record", () => {
    const character = mapCharacterDetail(buildApiCharacterDetail());

    expect(character).toEqual({
      id: "1",
      name: "Rick Sanchez",
      imageUrl: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
      status: "alive",
      species: "Human",
      gender: "male",
      origin: { id: "1", name: "Earth (C-137)" },
      location: { id: "3", name: "Citadel of Ricks" },
      episodeCount: 2,
      episodeSeasons: [{ season: 1, count: 2 }],
    });
  });

  it("falls back to safe defaults for missing optional fields", () => {
    const character = mapCharacterDetail(
      buildApiCharacterDetail({
        name: null,
        image: null,
        episodeCount: null,
        episodeSeasons: [],
      }),
    );

    expect(character.name).toBe("Unknown");
    expect(character.imageUrl).toBe("");
    expect(character.episodeCount).toBe(0);
    expect(character.episodeSeasons).toEqual([]);
  });

  it("gives origin/location a null id when the location is unknown, not a real entity", () => {
    const character = mapCharacterDetail(
      buildApiCharacterDetail({
        origin: { id: null, name: "unknown" },
        location: null,
      }),
    );

    expect(character.origin).toEqual({ id: null, name: "Unknown" });
    expect(character.location).toEqual({ id: null, name: "Unknown" });
  });

  it("keeps a null season (the unparsed-code group) as null, not a default", () => {
    const character = mapCharacterDetail(
      buildApiCharacterDetail({
        episodeSeasons: [
          { season: 1, count: 2 },
          { season: null, count: 1 },
        ],
      }),
    );

    expect(character.episodeSeasons).toEqual([
      { season: 1, count: 2 },
      { season: null, count: 1 },
    ]);
  });

  it("handles a genuinely absent episode summary without throwing (returnPartialData)", () => {
    // `returnPartialData` can hand us a character whose episode fields
    // haven't arrived from the network yet -- the mapper's input type
    // (DeepPartial) already reflects that as legitimately possible, no
    // cast needed to construct this fixture.
    const { episodeCount, episodeSeasons, ...partialCharacter } =
      buildApiCharacterDetail();
    void episodeCount; // intentionally discarded -- that's the point of this fixture
    void episodeSeasons;

    expect(() => mapCharacterDetail(partialCharacter)).not.toThrow();
    const character = mapCharacterDetail(partialCharacter);
    expect(character.episodeCount).toBe(0);
    expect(character.episodeSeasons).toEqual([]);
  });
});
