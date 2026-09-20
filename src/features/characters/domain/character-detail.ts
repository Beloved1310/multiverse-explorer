import type { CharacterStatus } from "./character";

export interface CharacterLocationRef {
  /** null when the location is "unknown" -- there's no real entity to link to. */
  id: string | null;
  name: string;
}

export interface CharacterEpisode {
  id: string;
  name: string;
  /** e.g. "S01E01" */
  code: string;
  airDate: string;
}

export interface CharacterEpisodeSeasonSummary {
  season: number | null;
  count: number;
}

export interface CharacterDetail {
  id: string;
  name: string;
  imageUrl: string;
  status: CharacterStatus;
  species: string;
  gender: string;
  origin: CharacterLocationRef;
  location: CharacterLocationRef;
  episodeCount: number;
  /** Season/count summary only -- episodes for a given season are fetched paginated, on demand, once that season is expanded. */
  episodeSeasons: CharacterEpisodeSeasonSummary[];
}
