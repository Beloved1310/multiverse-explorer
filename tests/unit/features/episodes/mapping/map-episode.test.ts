import { describe, expect, it } from "vitest";
import {
  mapEpisode,
  type ApiEpisode,
} from "@/features/episodes/mapping/map-episode";

function buildApiEpisode(overrides: Partial<ApiEpisode> = {}): ApiEpisode {
  return {
    id: "1",
    name: "Pilot",
    episode: "S01E01",
    air_date: "December 2, 2013",
    characters: [{ id: "1" }, { id: "2" }],
    ...overrides,
  };
}

describe("mapEpisode", () => {
  it("maps a complete record", () => {
    const episode = mapEpisode(buildApiEpisode());

    expect(episode).toEqual({
      id: "1",
      name: "Pilot",
      code: "S01E01",
      airDate: "December 2, 2013",
      characterCount: 2,
    });
  });

  it("falls back to safe defaults for missing optional fields", () => {
    const episode = mapEpisode(
      buildApiEpisode({ name: null, episode: null, air_date: null }),
    );

    expect(episode.name).toBe("Unknown");
    expect(episode.code).toBe("Unknown");
    expect(episode.airDate).toBe("Unknown");
  });

  it("drops null character entries when counting characters", () => {
    const episode = mapEpisode(
      buildApiEpisode({ characters: [null, { id: "1" }, { id: "2" }] }),
    );

    expect(episode.characterCount).toBe(2);
  });

  it("counts zero characters for an episode with none on record", () => {
    const episode = mapEpisode(buildApiEpisode({ characters: [] }));

    expect(episode.characterCount).toBe(0);
  });
});
