import { describe, expect, it } from "vitest";
import { groupEpisodesBySeason } from "@/lib/group-episodes-by-season";

interface TestEpisode {
  id: string;
  code: string;
}

function episode(code: string, id = code): TestEpisode {
  return { id, code };
}

describe("groupEpisodesBySeason", () => {
  it("sorts several seasons and their episodes in numeric order", () => {
    const groups = groupEpisodesBySeason([
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
    const groups = groupEpisodesBySeason([
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
    const groups = groupEpisodesBySeason([episode("TBA"), episode("S01E01")]);

    expect(groups.map(({ label }) => label)).toEqual(["Season 1", "Other"]);
    expect(groups[1]?.episodes.map(({ code }) => code)).toEqual(["TBA"]);
  });

  it("preserves whatever extra fields the caller's type carries", () => {
    interface FullEpisode extends TestEpisode {
      name: string;
      characterCount: number;
    }

    const groups = groupEpisodesBySeason<FullEpisode>([
      { id: "1", code: "S01E01", name: "Pilot", characterCount: 4 },
    ]);

    expect(groups[0]?.episodes[0]).toEqual({
      id: "1",
      code: "S01E01",
      name: "Pilot",
      characterCount: 4,
    });
  });
});
