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
    episode: [
      {
        id: "1",
        name: "Pilot",
        episode: "S01E01",
        air_date: "December 2, 2013",
      },
      {
        id: "2",
        name: "Lawnmower Dog",
        episode: "S01E02",
        air_date: "December 9, 2013",
      },
    ],
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
      episodes: [
        { id: "1", name: "Pilot", code: "S01E01", airDate: "December 2, 2013" },
        {
          id: "2",
          name: "Lawnmower Dog",
          code: "S01E02",
          airDate: "December 9, 2013",
        },
      ],
    });
  });

  it("falls back to safe defaults for missing optional fields", () => {
    const character = mapCharacterDetail(
      buildApiCharacterDetail({ name: null, image: null, episode: [] }),
    );

    expect(character.name).toBe("Unknown");
    expect(character.imageUrl).toBe("");
    expect(character.episodes).toEqual([]);
  });

  it("gives origin/location a null id when the location is unknown, not a real entity", () => {
    const character = mapCharacterDetail(
      buildApiCharacterDetail({
        origin: { id: null, name: "unknown" },
        location: null,
      }),
    );

    expect(character.origin).toEqual({ id: null, name: "unknown" });
    expect(character.location).toEqual({ id: null, name: "Unknown" });
  });

  it("handles null episode entries and a null episode code/air date without throwing", () => {
    const character = mapCharacterDetail(
      buildApiCharacterDetail({
        episode: [
          null,
          { id: "3", name: "Anatomy Park", episode: null, air_date: null },
        ],
      }),
    );

    expect(character.episodes).toEqual([
      { id: "3", name: "Anatomy Park", code: "Unknown", airDate: "Unknown" },
    ]);
  });

  it("handles a genuinely absent episode field without throwing (returnPartialData)", () => {
    // `returnPartialData` can hand us a character whose `episode` field
    // hasn't arrived from the network yet -- the mapper's input type
    // (DeepPartial) already reflects that as legitimately possible, no
    // cast needed to construct this fixture.
    const { episode, ...partialCharacter } = buildApiCharacterDetail();
    void episode; // intentionally discarded -- that's the point of this fixture

    expect(() => mapCharacterDetail(partialCharacter)).not.toThrow();
    expect(mapCharacterDetail(partialCharacter).episodes).toEqual([]);
  });
});
