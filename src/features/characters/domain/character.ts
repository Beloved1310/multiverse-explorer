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
