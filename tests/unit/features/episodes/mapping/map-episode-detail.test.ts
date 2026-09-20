import { describe, expect, it } from "vitest";
import {
  mapEpisodeDetail,
  type ApiEpisodeDetail,
} from "@/features/episodes/mapping/map-episode-detail";

function buildApiEpisodeDetail(
  overrides: Partial<ApiEpisodeDetail> = {},
): ApiEpisodeDetail {
  return {
    id: "1",
    name: "Pilot",
    episode: "S01E01",
    air_date: "December 2, 2013",
    characters: [
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

describe("mapEpisodeDetail", () => {
  it("maps a complete record, reusing the character mapper for its cast", () => {
    const episode = mapEpisodeDetail(buildApiEpisodeDetail());

    expect(episode.id).toBe("1");
    expect(episode.name).toBe("Pilot");
    expect(episode.code).toBe("S01E01");
    expect(episode.airDate).toBe("December 2, 2013");
    expect(episode.characters).toEqual([
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
    const episode = mapEpisodeDetail(
      buildApiEpisodeDetail({ name: null, episode: null, air_date: null }),
    );

    expect(episode.name).toBe("Unknown");
    expect(episode.code).toBe("Unknown");
    expect(episode.airDate).toBe("Unknown");
  });

  it("drops null character entries instead of throwing", () => {
    const episode = mapEpisodeDetail(
      buildApiEpisodeDetail({
        characters: [null, ...(buildApiEpisodeDetail().characters ?? [])],
      }),
    );

    expect(episode.characters).toHaveLength(1);
  });
});
