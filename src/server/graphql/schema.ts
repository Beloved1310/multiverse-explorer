import "server-only";

import { GraphQLError } from "graphql";
import { getConnectedDataset } from "@/server/data/loader";
import type { GraphQLContext } from "@/server/graphql/context";
import {
  createSavedFilter,
  deleteSavedFilter,
  importSavedFilters,
  listSavedFilters,
  SavedFilterLimitError,
  SavedFilterValidationError,
  type SavedFilterInput,
} from "@/server/saved-filters/service";
import {
  clampCollectionLimit,
  filterCharacters,
  filterLocations,
  findSharedEpisodes,
  findSharedLocations,
  paginate,
  selectCharactersWithUnknownOrigins,
  selectMostPopulatedLocations,
  selectMostSeenCharacters,
  sortCharacters,
  type CharacterFilterInput,
  type CharacterSortField,
  type LocationFilterInput,
  type SortDirection,
} from "./query-utils";
import { createSearchRecovery } from "./search-recovery";

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

function requireUserId(context: GraphQLContext) {
  if (!context.userId) {
    throw new GraphQLError("Sign in to manage saved searches.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.userId;
}

function savedFilterError(error: unknown): never {
  if (error instanceof SavedFilterValidationError) {
    throw new GraphQLError(error.message, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  if (error instanceof SavedFilterLimitError) {
    throw new GraphQLError(error.message, {
      extensions: { code: "SAVED_FILTER_LIMIT" },
    });
  }
  throw error;
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
    savedCharacterFilters: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext,
    ) => listSavedFilters(requireUserId(context)),
  },
  Mutation: {
    createSavedCharacterFilter: async (
      _: unknown,
      args: { input: SavedFilterInput },
      context: GraphQLContext,
    ) => {
      try {
        return await createSavedFilter(requireUserId(context), args.input);
      } catch (error) {
        return savedFilterError(error);
      }
    },
    importSavedCharacterFilters: async (
      _: unknown,
      args: { inputs: SavedFilterInput[] },
      context: GraphQLContext,
    ) => {
      try {
        return await importSavedFilters(requireUserId(context), args.inputs);
      } catch (error) {
        return savedFilterError(error);
      }
    },
    deleteSavedCharacterFilter: (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => deleteSavedFilter(requireUserId(context), args.id),
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
