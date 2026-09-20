import "server-only";

import { getConnectedDataset } from "@/server/data/loader";
import {
  clampCollectionLimit,
  filterCharacters,
  filterLocations,
  findSharedEpisodes,
  findSharedLocations,
  paginate,
  selectCharacterEpisodesInSeason,
  selectCharactersWithUnknownOrigins,
  selectMostPopulatedLocations,
  selectMostSeenCharacters,
  sortCharacters,
  summarizeCharacterEpisodeSeasons,
  type CharacterFilterInput,
  type CharacterSortField,
  type LocationFilterInput,
  type SortDirection,
} from "./query-utils";
import { createSearchRecovery } from "./search-recovery";

/** Small chunks -- a season rarely has many episodes, but the point is that "load more" is real regardless. */
const CHARACTER_EPISODES_PER_SEASON_PAGE_SIZE = 5;

const toLocation = (location: {
  id: string;
  name: string;
  type: string;
  dimension: string;
  residentIds: string[];
}) => ({
  ...location,
  residentCount: location.residentIds.length,
});

function includesText(value: string, query?: string | null) {
  return !query || value.toLowerCase().includes(query.trim().toLowerCase());
}

export const resolvers = {
  Query: {
    characters: async (
      _: unknown,
      args: {
        filter?: CharacterFilterInput;
        page?: number;
        sort?: { field?: CharacterSortField; direction?: SortDirection };
      },
    ) => {
      const dataset = await getConnectedDataset();
      const filtered = filterCharacters(dataset.characters, args.filter);
      return paginate(
        sortCharacters(filtered, args.sort?.field, args.sort?.direction),
        args.page,
      );
    },
    character: async (_: unknown, args: { id: string }) => {
      const dataset = await getConnectedDataset();
      return (
        dataset.characters.find((character) => character.id === args.id) ?? null
      );
    },
    episodes: async (
      _: unknown,
      args: { filter?: { name?: string; episode?: string }; page?: number },
    ) => {
      const dataset = await getConnectedDataset();
      return paginate(
        dataset.episodes.filter(
          (episode) =>
            includesText(episode.name, args.filter?.name) &&
            includesText(episode.code, args.filter?.episode),
        ),
        args.page,
      );
    },
    episode: async (_: unknown, args: { id: string }) => {
      const dataset = await getConnectedDataset();
      return dataset.episodes.find((episode) => episode.id === args.id) ?? null;
    },
    locations: async (
      _: unknown,
      args: { filter?: LocationFilterInput; page?: number },
    ) => {
      const dataset = await getConnectedDataset();
      return paginate(
        filterLocations(dataset.locations, args.filter).map(toLocation),
        args.page,
      );
    },
    location: async (_: unknown, args: { id: string }) => {
      const dataset = await getConnectedDataset();
      const location = dataset.locations.find((item) => item.id === args.id);
      return location ? toLocation(location) : null;
    },
    allLocations: async () => {
      const dataset = await getConnectedDataset();
      return dataset.locations.map(toLocation);
    },
    curatedCollections: async (_: unknown, args: { limit?: number }) => {
      const dataset = await getConnectedDataset();
      const limit = clampCollectionLimit(args.limit);
      return {
        mostSeenCharacters: selectMostSeenCharacters(dataset.characters, limit),
        charactersWithUnknownOrigins: selectCharactersWithUnknownOrigins(
          dataset.characters,
          limit,
        ),
        mostPopulatedLocations: selectMostPopulatedLocations(
          dataset.locations,
          limit,
        ).map(toLocation),
      };
    },
    compareCharacters: async (
      _: unknown,
      args: { firstId: string; secondId: string },
    ) => {
      if (args.firstId === args.secondId) return null;

      const dataset = await getConnectedDataset();
      const first = dataset.characters.find(
        (character) => character.id === args.firstId,
      );
      const second = dataset.characters.find(
        (character) => character.id === args.secondId,
      );
      if (!first || !second) return null;

      return {
        first,
        second,
        sharedEpisodes: findSharedEpisodes(first, second, dataset.episodes),
        sharedLocations: findSharedLocations(first, second).map(toLocation),
      };
    },
    searchRecovery: async (
      _: unknown,
      args: { input: CharacterFilterInput },
    ) => {
      const dataset = await getConnectedDataset();
      return createSearchRecovery(dataset.characters, args.input);
    },
  },
  Character: {
    origin: (character: { origin: Parameters<typeof toLocation>[0] | null }) =>
      character.origin ? toLocation(character.origin) : null,
    location: (character: {
      location: Parameters<typeof toLocation>[0] | null;
    }) => (character.location ? toLocation(character.location) : null),
    episode: async (character: { episodeIds: string[] }) => {
      const dataset = await getConnectedDataset();
      const episodesById = new Map(
        dataset.episodes.map((episode) => [episode.id, episode]),
      );
      return character.episodeIds.flatMap((id) => {
        const episode = episodesById.get(id);
        return episode ? [episode] : [];
      });
    },
    episodeSeasons: async (character: { episodeIds: string[] }) => {
      const dataset = await getConnectedDataset();
      return summarizeCharacterEpisodeSeasons(
        character.episodeIds,
        dataset.episodes,
      );
    },
    episodesInSeason: async (
      character: { episodeIds: string[] },
      args: { season?: number | null; page?: number },
    ) => {
      const dataset = await getConnectedDataset();
      const seasonEpisodes = selectCharacterEpisodesInSeason(
        character.episodeIds,
        args.season ?? null,
        dataset.episodes,
      );
      return paginate(
        seasonEpisodes,
        args.page,
        CHARACTER_EPISODES_PER_SEASON_PAGE_SIZE,
      );
    },
  },
  Episode: {
    episode: (episode: { code: string }) => episode.code,
    air_date: (episode: { airDate: string }) => episode.airDate,
    characters: async (episode: { characterIds: string[] }) => {
      const dataset = await getConnectedDataset();
      const charactersById = new Map(
        dataset.characters.map((character) => [character.id, character]),
      );
      return episode.characterIds.flatMap((id) => {
        const character = charactersById.get(id);
        return character ? [character] : [];
      });
    },
  },
  Location: {
    residents: async (location: { residentIds: string[] }) => {
      const dataset = await getConnectedDataset();
      const charactersById = new Map(
        dataset.characters.map((character) => [character.id, character]),
      );
      return location.residentIds.flatMap((id) => {
        const character = charactersById.get(id);
        return character ? [character] : [];
      });
    },
    episodesFeaturingResidents: async (location: { residentIds: string[] }) => {
      const dataset = await getConnectedDataset();
      const residents = new Set(location.residentIds);
      return dataset.episodes.filter((episode) =>
        episode.characterIds.some((id) => residents.has(id)),
      );
    },
  },
  SearchRecoveryOption: {
    filter: (option: { filter: CharacterFilterInput }) => ({
      ...option.filter,
      statuses: option.filter.statuses ?? [],
    }),
  },
};
