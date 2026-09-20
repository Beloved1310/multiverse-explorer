import { describe, expect, it } from "vitest";
import type { CharacterEpisode } from "@/features/characters/domain/character-detail";
import { groupCharacterEpisodesBySeason } from "@/features/characters/domain/group-character-episodes";

function episode(code: string, id = code): CharacterEpisode {
  return { id, code, name: `Episode ${code}`, airDate: "December 2, 2013" };
}

describe("groupCharacterEpisodesBySeason", () => {
  it("sorts several seasons and their episodes in numeric order", () => {
    const groups = groupCharacterEpisodesBySeason([
      episode("S02E03"),
      episode("S01E02"),
      episode("S01E01"),
      episode("S02E01"),
    ]);

    expect(groups.map(({ label }) => label)).toEqual(["Season 1", "Season 2"]);
    expect(groups[0]?.episodes.map(({ code }) => code)).toEqual([
      "S01E01",
      "S01E02",
    ]);
    expect(groups[1]?.episodes.map(({ code }) => code)).toEqual([
      "S02E01",
      "S02E03",
    ]);
  });

  it("keeps a single season in one group", () => {
    const groups = groupCharacterEpisodesBySeason([
      episode("S03E02"),
      episode("S03E01"),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBe("Season 3");
    expect(groups[0]?.episodes.map(({ code }) => code)).toEqual([
      "S03E01",
      "S03E02",
    ]);
  });

  it("places unexpected formats in an Other group after numbered seasons", () => {
    const groups = groupCharacterEpisodesBySeason([
      episode("TBA"),
      episode("S01E01"),
    ]);

    expect(groups.map(({ label }) => label)).toEqual(["Season 1", "Other"]);
    expect(groups[1]?.episodes.map(({ code }) => code)).toEqual(["TBA"]);
  });
});
