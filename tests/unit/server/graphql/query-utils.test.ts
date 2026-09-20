import { describe, expect, it } from "vitest";
import {
  clampCollectionLimit,
  filterCharacters,
  findSharedEpisodes,
  findSharedLocations,
  paginate,
  selectCharactersWithUnknownOrigins,
  selectMostPopulatedLocations,
  selectMostSeenCharacters,
  sortCharacters,
} from "@/server/graphql/query-utils";
import type {
  ConnectedCharacter,
  ConnectedEpisode,
  RawLocation,
} from "@/server/data/types";

const location = (
  id: string,
  name: string,
  residentIds: string[] = [],
): RawLocation => ({
  id,
  name,
  type: "Planet",
  dimension: "C-137",
  residentIds,
});

const character = (
  id: string,
  name: string,
  episodeCount: number,
  status = "Alive",
  overrides: Partial<ConnectedCharacter> = {},
): ConnectedCharacter => ({
  id,
  name,
  episodeCount,
  status,
  image: "",
  species: "Human",
  gender: "Male",
  originId: null,
  locationId: null,
  episodeIds: [],
  origin: null,
  location: {
    id: "c137",
    name: "Earth",
    type: "Planet",
    dimension: "C-137",
    residentIds: [],
  },
  ...overrides,
});

const episode = (id: string, name: string): ConnectedEpisode => ({
  id,
  name,
  code: `S01E0${id}`,
  airDate: "December 2, 2013",
  characterIds: [],
  season: 1,
  episodeNumber: Number(id),
});

describe("BFF query utilities", () => {
  const characters = [
    character("1", "Rick", 11),
    character("2", "Morty", 3, "unknown"),
    character("3", "Summer", 8, "Dead"),
  ];

  it("filters partial names, multiple statuses, dimensions, and episode counts", () => {
    expect(
      filterCharacters(characters, {
        name: "ri",
        statuses: ["alive", "unknown"],
        dimension: "c-137",
        minEpisodes: 10,
      }).map(({ id }) => id),
    ).toEqual(["1"]);
  });

  it("sorts by episode count and paginates with public-API-shaped info", () => {
    const sorted = sortCharacters(characters, "EPISODE_COUNT", "DESC");
    expect(sorted.map(({ id }) => id)).toEqual(["1", "3", "2"]);
    expect(paginate(sorted, 2, 2)).toMatchObject({
      info: { count: 3, pages: 2, next: null, prev: 1 },
      results: [characters[1]],
    });
  });
});

describe("clampCollectionLimit", () => {
  it("falls back to the default when limit is missing", () => {
    expect(clampCollectionLimit(undefined)).toBe(6);
  });

  it("clamps to the 1-12 range", () => {
    expect(clampCollectionLimit(0)).toBe(1);
    expect(clampCollectionLimit(20)).toBe(12);
  });
});

describe("selectMostSeenCharacters", () => {
  it("returns the most-seen characters first, limited", () => {
    const characters = [
      character("1", "Rick", 11),
      character("2", "Morty", 3),
      character("3", "Summer", 8),
    ];
    expect(selectMostSeenCharacters(characters, 2).map(({ id }) => id)).toEqual(
      ["1", "3"],
    );
  });
});

describe("selectCharactersWithUnknownOrigins", () => {
  it("keeps characters with a missing or unknown origin, sorted by name", () => {
    const characters = [
      character("1", "Summer", 1, "Alive", { origin: null }),
      character("2", "Rick", 1, "Alive", { origin: location("l1", "Unknown") }),
      character("3", "Morty", 1, "Alive", { origin: location("l2", "Earth") }),
    ];
    expect(
      selectCharactersWithUnknownOrigins(characters, 10).map(({ id }) => id),
    ).toEqual(["2", "1"]);
  });
});

describe("selectMostPopulatedLocations", () => {
  it("returns the most populated locations first, tie-broken by name", () => {
    const locations = [
      location("1", "Earth", ["a", "b"]),
      location("2", "Citadel", ["a", "b"]),
      location("3", "Purge Planet", ["a"]),
    ];
    expect(
      selectMostPopulatedLocations(locations, 2).map(({ id }) => id),
    ).toEqual(["2", "1"]);
  });
});

describe("findSharedEpisodes", () => {
  it("returns episodes both characters appear in", () => {
    const first = character("1", "Rick", 2, "Alive", {
      episodeIds: ["e1", "e2"],
    });
    const second = character("2", "Morty", 2, "Alive", {
      episodeIds: ["e2", "e3"],
    });
    const episodes = [
      episode("e1", "Pilot"),
      episode("e2", "Lawnmower Dog"),
      episode("e3", "Anatomy Park"),
    ];
    expect(
      findSharedEpisodes(first, second, episodes).map(({ id }) => id),
    ).toEqual(["e2"]);
  });
});

describe("findSharedLocations", () => {
  it("returns locations that are the origin or current location of both characters", () => {
    const shared = location("earth", "Earth");
    const first = character("1", "Rick", 1, "Alive", {
      origin: shared,
      location: shared,
    });
    const second = character("2", "Morty", 1, "Alive", {
      origin: shared,
      location: location("citadel", "Citadel"),
    });
    expect(findSharedLocations(first, second).map(({ id }) => id)).toEqual([
      "earth",
    ]);
  });

  it("de-duplicates when both origin and location match", () => {
    const shared = location("earth", "Earth");
    const first = character("1", "Rick", 1, "Alive", {
      origin: shared,
      location: shared,
    });
    const second = character("2", "Morty", 1, "Alive", {
      origin: shared,
      location: shared,
    });
    expect(findSharedLocations(first, second).map(({ id }) => id)).toEqual([
      "earth",
    ]);
  });

  it("returns nothing when no location is shared", () => {
    const first = character("1", "Rick", 1, "Alive", {
      origin: location("earth", "Earth"),
      location: null,
    });
    const second = character("2", "Morty", 1, "Alive", {
      origin: location("citadel", "Citadel"),
      location: null,
    });
    expect(findSharedLocations(first, second)).toEqual([]);
  });
});
