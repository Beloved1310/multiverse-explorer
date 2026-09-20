import type { Character } from "@/features/characters/domain/character";
import type { Episode } from "@/features/episodes/domain/episode";

export interface LocationDetail {
  id: string;
  name: string;
  type: string;
  dimension: string;
  // Reuses the characters feature's domain type (and its CharacterCard) --
  // see episode-detail.ts for the same reasoning.
  residents: Character[];
  episodesFeaturingResidents: Episode[];
}
