import "server-only";

import { unstable_cache } from "next/cache";
import { retryWithBackoff } from "@/lib/apollo/retry-condition";
import { logError } from "@/lib/logger";
import snapshot from "./snapshot.json";
import { connectDataset } from "./connect";
import type { ConnectedDataset, RawDataset } from "./types";

const ENDPOINT =
  process.env.RICK_AND_MORTY_GRAPHQL_ENDPOINT ??
  "https://rickandmortyapi.com/graphql";
const BATCH_SIZE = 100;
const ONE_DAY = 60 * 60 * 24;

class GraphQLResponseError extends Error {
  graphQLErrors: unknown[];

  constructor(errors: unknown[]) {
    super("The public GraphQL API returned an error.");
    this.graphQLErrors = errors;
  }
}

async function request<T>(query: string, variables?: Record<string, unknown>) {
  return retryWithBackoff(async () => {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error(`Public API returned ${response.status}.`);

    const payload = (await response.json()) as { data?: T; errors?: unknown[] };
    if (payload.errors?.length) throw new GraphQLResponseError(payload.errors);
    if (!payload.data) throw new Error("Public API returned no data.");
    return payload.data;
  });
}

function idsFor(count: number): string[] {
  return Array.from({ length: count }, (_, index) => String(index + 1));
}

function chunks<T>(values: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) =>
    values.slice(index * size, (index + 1) * size),
  );
}

const COUNTS_QUERY = `query DatasetCounts { characters { info { count } } locations { info { count } } episodes { info { count } } }`;
const CHARACTERS_QUERY = `query CharactersByIds($ids: [ID!]!) { charactersByIds(ids: $ids) { id name image status species gender origin { id } location { id } episode { id } } }`;
const LOCATIONS_QUERY = `query LocationsByIds($ids: [ID!]!) { locationsByIds(ids: $ids) { id name type dimension residents { id } } }`;
const EPISODES_QUERY = `query EpisodesByIds($ids: [ID!]!) { episodesByIds(ids: $ids) { id name episode air_date characters { id } } }`;

interface IdRef {
  id: string | null;
}

interface ApiCharacter {
  id: string | null;
  name: string | null;
  image: string | null;
  status: string | null;
  species: string | null;
  gender: string | null;
  origin: IdRef | null;
  location: IdRef | null;
  episode: Array<IdRef | null> | null;
}

interface ApiLocation {
  id: string | null;
  name: string | null;
  type: string | null;
  dimension: string | null;
  residents: Array<IdRef | null> | null;
}

interface ApiEpisode {
  id: string | null;
  name: string | null;
  episode: string | null;
  air_date: string | null;
  characters: Array<IdRef | null> | null;
}

async function loadLiveDataset(): Promise<RawDataset> {
  const counts = await request<{
    characters: { info: { count: number } | null } | null;
    locations: { info: { count: number } | null } | null;
    episodes: { info: { count: number } | null } | null;
  }>(COUNTS_QUERY);

  const [characterPages, locationPages, episodePages] = await Promise.all([
    Promise.all(
      chunks(idsFor(counts.characters?.info?.count ?? 0), BATCH_SIZE).map(
        (ids) =>
          request<{ charactersByIds: Array<ApiCharacter | null> }>(
            CHARACTERS_QUERY,
            { ids },
          ),
      ),
    ),
    Promise.all(
      chunks(idsFor(counts.locations?.info?.count ?? 0), BATCH_SIZE).map(
        (ids) =>
          request<{ locationsByIds: Array<ApiLocation | null> }>(
            LOCATIONS_QUERY,
            { ids },
          ),
      ),
    ),
    Promise.all(
      chunks(idsFor(counts.episodes?.info?.count ?? 0), BATCH_SIZE).map((ids) =>
        request<{ episodesByIds: Array<ApiEpisode | null> }>(EPISODES_QUERY, {
          ids,
        }),
      ),
    ),
  ]);

  const characters = characterPages
    .flatMap((page) => page.charactersByIds)
    .filter((character): character is ApiCharacter => character !== null)
    .map((item) => {
      return {
        id: item.id ?? "",
        name: item.name ?? "Unknown",
        image: item.image ?? "",
        status: item.status ?? "unknown",
        species: item.species ?? "Unknown",
        gender: item.gender ?? "unknown",
        originId: item.origin?.id ?? null,
        locationId: item.location?.id ?? null,
        episodeIds: (item.episode ?? []).flatMap((episode) =>
          episode?.id ? [episode.id] : [],
        ),
      };
    });
  const locations = locationPages
    .flatMap((page) => page.locationsByIds)
    .filter((location): location is ApiLocation => location !== null)
    .map((item) => {
      return {
        id: item.id ?? "",
        name: item.name ?? "Unknown",
        type: item.type ?? "Unknown",
        dimension: item.dimension ?? "Unknown",
        residentIds: (item.residents ?? []).flatMap((resident) =>
          resident?.id ? [resident.id] : [],
        ),
      };
    });
  const episodes = episodePages
    .flatMap((page) => page.episodesByIds)
    .filter((episode): episode is ApiEpisode => episode !== null)
    .map((item) => {
      return {
        id: item.id ?? "",
        name: item.name ?? "Unknown",
        code: item.episode ?? "Unknown",
        airDate: item.air_date ?? "Unknown",
        characterIds: (item.characters ?? []).flatMap((character) =>
          character?.id ? [character.id] : [],
        ),
      };
    });

  return { characters, locations, episodes };
}

async function loadConnectedDataset(): Promise<ConnectedDataset> {
  try {
    return connectDataset(await loadLiveDataset());
  } catch (error) {
    logError("dataset_load_failed", { fallback: "snapshot" }, error);
    return connectDataset(snapshot);
  }
}

/** Cached for 24 hours. See Next.js: Functions: unstable_cache. */
export const getConnectedDataset = unstable_cache(
  loadConnectedDataset,
  ["multiverse-bff-dataset-v1"],
  { revalidate: ONE_DAY, tags: ["multiverse-bff-dataset"] },
);

export { connectDataset, loadLiveDataset, loadConnectedDataset };
