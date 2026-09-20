export interface RawLocation {
  id: string;
  name: string;
  type: string;
  dimension: string;
  residentIds: string[];
}

export interface RawCharacter {
  id: string;
  name: string;
  image: string;
  status: string;
  species: string;
  gender: string;
  originId: string | null;
  locationId: string | null;
  episodeIds: string[];
}

export interface RawEpisode {
  id: string;
  name: string;
  code: string;
  airDate: string;
  characterIds: string[];
}

export interface RawDataset {
  characters: RawCharacter[];
  locations: RawLocation[];
  episodes: RawEpisode[];
}

export interface ConnectedEpisode extends RawEpisode {
  season: number | null;
  episodeNumber: number | null;
}

export interface ConnectedCharacter extends RawCharacter {
  origin: RawLocation | null;
  location: RawLocation | null;
  episodeCount: number;
}

export interface ConnectedDataset {
  characters: ConnectedCharacter[];
  locations: RawLocation[];
  episodes: ConnectedEpisode[];
  loadedAt: string;
}
