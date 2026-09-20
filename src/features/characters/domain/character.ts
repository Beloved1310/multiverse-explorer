export type CharacterStatus = "alive" | "dead" | "unknown";

export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  status: CharacterStatus;
  species: string;
  gender: string;
  origin: string;
  location: string;
  episodes: string[];
}

/**
 * The single source of truth for how a status displays -- previously
 * defined three times independently (here, character-card.tsx,
 * character-detail-view.tsx) with the risk of them drifting apart.
 */
export const STATUS_LABELS: Record<CharacterStatus, string> = {
  alive: "Alive",
  dead: "Dead",
  unknown: "Unknown",
};
