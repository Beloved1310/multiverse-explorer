import { describe, expect, it } from "vitest";
import { connectDataset } from "@/server/data/connect";

describe("connectDataset", () => {
  it("links character locations, counts appearances, and parses episode codes", () => {
    const dataset = connectDataset({
      locations: [
        {
          id: "earth",
          name: "Earth",
          type: "Planet",
          dimension: "C-137",
          residentIds: ["rick"],
        },
      ],
      characters: [
        {
          id: "rick",
          name: "Rick",
          image: "",
          status: "Alive",
          species: "Human",
          gender: "Male",
          originId: "earth",
          locationId: "earth",
          episodeIds: ["one", "other"],
        },
      ],
      episodes: [
        {
          id: "one",
          name: "Pilot",
          code: "S01E01",
          airDate: "2013",
          characterIds: ["rick"],
        },
        {
          id: "other",
          name: "Special",
          code: "TBA",
          airDate: "Unknown",
          characterIds: [],
        },
      ],
    });

    expect(dataset.characters[0]).toMatchObject({
      episodeCount: 2,
      origin: { id: "earth" },
      location: { id: "earth" },
    });
    expect(dataset.episodes[0]).toMatchObject({ season: 1, episodeNumber: 1 });
    expect(dataset.episodes[1]).toMatchObject({
      season: null,
      episodeNumber: null,
    });
  });
});
