import type {
  ConnectedCharacter,
  ConnectedEpisode,
  RawLocation,
} from "@/server/data/types";

export type SortDirection = "ASC" | "DESC";
export type CharacterSortField = "NAME" | "EPISODE_COUNT";

export interface CharacterFilterInput {
  name?: string | null;
  statuses?: string[] | null;
  species?: string | null;
  gender?: string | null;
  dimension?: string | null;
  minEpisodes?: number | null;
}

export interface LocationFilterInput {
  name?: string | null;
  type?: string | null;
  dimension?: string | null;
}

const includes = (value: string, search?: string | null) =>
  !search || value.toLocaleLowerCase().includes(search.toLocaleLowerCase());

export function filterCharacters(
  characters: ConnectedCharacter[],
  filter: CharacterFilterInput = {},
): ConnectedCharacter[] {
  const statuses = filter.statuses?.map((status) => status.toLocaleLowerCase());
  return characters.filter(
    (character) =>
      includes(character.name, filter.name) &&
      (!statuses?.length ||
        statuses.includes(character.status.toLocaleLowerCase())) &&
      includes(character.species, filter.species) &&
      includes(character.gender, filter.gender) &&
      includes(
        character.location?.dimension ?? character.origin?.dimension ?? "",
        filter.dimension,
      ) &&
      (filter.minEpisodes === undefined ||
        filter.minEpisodes === null ||
        character.episodeCount >= filter.minEpisodes),
  );
}

export function filterLocations(
  locations: RawLocation[],
  filter: LocationFilterInput = {},
): RawLocation[] {
  return locations.filter(
    (location) =>
      includes(location.name, filter.name) &&
      includes(location.type, filter.type) &&
      includes(location.dimension, filter.dimension),
  );
}

export function sortCharacters(
  characters: ConnectedCharacter[],
  field: CharacterSortField = "NAME",
  direction: SortDirection = "ASC",
): ConnectedCharacter[] {
  const multiplier = direction === "DESC" ? -1 : 1;
  return [...characters].sort((first, second) => {
    const result =
      field === "EPISODE_COUNT"
        ? first.episodeCount - second.episodeCount ||
          first.name.localeCompare(second.name)
        : first.name.localeCompare(second.name);
    return result * multiplier;
  });
}

export interface PageInfo {
  count: number;
  pages: number;
  next: number | null;
  prev: number | null;
}

export function paginate<T>(
  values: T[],
  page = 1,
  pageSize = 20,
): { info: PageInfo; results: T[] } {
  const count = values.length;
  const pages = Math.max(1, Math.ceil(count / pageSize));
  const currentPage = Math.min(Math.max(1, page), pages);
  return {
    info: {
      count,
      pages,
      next: currentPage < pages ? currentPage + 1 : null,
      prev: currentPage > 1 ? currentPage - 1 : null,
    },
    results: values.slice((currentPage - 1) * pageSize, currentPage * pageSize),
  };
}

/** Keeps curatedCollections' `limit` argument within a sane range. */
export function clampCollectionLimit(
  limit?: number | null,
  fallback = 6,
): number {
  return Math.min(Math.max(limit ?? fallback, 1), 12);
}

export function selectMostSeenCharacters(
  characters: ConnectedCharacter[],
  limit: number,
): ConnectedCharacter[] {
  return sortCharacters(characters, "EPISODE_COUNT", "DESC").slice(0, limit);
}

export function selectCharactersWithUnknownOrigins(
  characters: ConnectedCharacter[],
  limit: number,
): ConnectedCharacter[] {
  return characters
    .filter(
      (character) =>
        !character.origin ||
        character.origin.name.toLocaleLowerCase() === "unknown",
    )
    .sort((first, second) => first.name.localeCompare(second.name))
    .slice(0, limit);
}

export function selectMostPopulatedLocations(
  locations: RawLocation[],
  limit: number,
): RawLocation[] {
  return [...locations]
    .sort(
      (first, second) =>
        second.residentIds.length - first.residentIds.length ||
        first.name.localeCompare(second.name),
    )
    .slice(0, limit);
}

/** Episodes that appear in both characters' episode lists. */
export function findSharedEpisodes(
  first: ConnectedCharacter,
  second: ConnectedCharacter,
  episodes: ConnectedEpisode[],
): ConnectedEpisode[] {
  const secondEpisodeIds = new Set(second.episodeIds);
  return episodes.filter(
    (episode) =>
      first.episodeIds.includes(episode.id) && secondEpisodeIds.has(episode.id),
  );
}

/** Locations that are the origin or current location of both characters. */
export function findSharedLocations(
  first: ConnectedCharacter,
  second: ConnectedCharacter,
): RawLocation[] {
  const firstLocationIds = new Set(
    [first.origin, first.location].flatMap((location) =>
      location ? [location.id] : [],
    ),
  );
  return [second.origin, second.location]
    .flatMap((location) => (location ? [location] : []))
    .filter(
      (location, index, values) =>
        firstLocationIds.has(location.id) &&
        values.findIndex((item) => item.id === location.id) === index,
    );
}
