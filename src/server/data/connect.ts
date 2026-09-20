import { parseEpisodeCode } from "@/lib/parse-episode-code";
import type { ConnectedDataset, RawDataset } from "./types";

/** Joins the small API catalogue into a query-friendly in-memory graph. */
export function connectDataset(raw: RawDataset): ConnectedDataset {
  const locationsById = new Map(
    raw.locations.map((location) => [location.id, location]),
  );

  return {
    locations: raw.locations,
    characters: raw.characters.map((character) => ({
      ...character,
      origin: character.originId
        ? (locationsById.get(character.originId) ?? null)
        : null,
      location: character.locationId
        ? (locationsById.get(character.locationId) ?? null)
        : null,
      episodeCount: character.episodeIds.length,
    })),
    episodes: raw.episodes.map((episode) => {
      const parsed = parseEpisodeCode(episode.code);
      return {
        ...episode,
        season: parsed?.season ?? null,
        episodeNumber: parsed?.episode ?? null,
      };
    }),
    loadedAt: new Date().toISOString(),
  };
}
