import { describe, expect, it } from "vitest";
import { parseEpisodeCode } from "@/lib/parse-episode-code";

describe("parseEpisodeCode", () => {
  it("parses a standard season and episode code", () => {
    expect(parseEpisodeCode("S01E07")).toEqual({ season: 1, episode: 7 });
  });

  it("safely rejects an unexpected code", () => {
    expect(parseEpisodeCode("Pilot")).toBeNull();
  });
});
