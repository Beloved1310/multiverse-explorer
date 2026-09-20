import type { Character } from "@/features/characters/domain/character";

export interface EpisodeDetail {
  id: string;
  name: string;
  /** e.g. "S01E01" */
  code: string;
  airDate: string;
  // Reuses the characters feature's domain type (and its CharacterCard)
  // rather than inventing a parallel shape: the API returns the same
  // character fields here as it does from the characters list, so there's
  // a real, matching query behind it -- not a coincidence of field names.
  characters: Character[];
}
