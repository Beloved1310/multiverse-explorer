import type { FilterEpisode } from "@/lib/graphql/generated/graphql";

export interface EpisodeFilters {
  name: string;
  code: string;
}

export const EMPTY_EPISODE_FILTERS: EpisodeFilters = {
  name: "",
  code: "",
};

export function parseEpisodeFiltersFromSearchParams(
  searchParams: URLSearchParams,
): EpisodeFilters {
  return {
    name: searchParams.get("name")?.trim() ?? "",
    code: searchParams.get("code")?.trim() ?? "",
  };
}

/** Builds URL search params from filters, omitting empty values so the URL stays clean. */
export function buildEpisodeFiltersSearchParams(
  filters: Partial<EpisodeFilters>,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.name) params.set("name", filters.name);
  if (filters.code) params.set("code", filters.code);
  return params;
}

/** Maps our URL-shaped filters to the GraphQL filter input, omitting empty fields. */
export function toGraphQLEpisodeFilter(
  filters: EpisodeFilters,
): FilterEpisode | undefined {
  const filter: FilterEpisode = {};
  if (filters.name) filter.name = filters.name;
  if (filters.code) filter.episode = filters.code;
  return Object.keys(filter).length > 0 ? filter : undefined;
}

export function countActiveEpisodeFilters(filters: EpisodeFilters): number {
  return Object.values(filters).filter((value) => value !== "").length;
}
