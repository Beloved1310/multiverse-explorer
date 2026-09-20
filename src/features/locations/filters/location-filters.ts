import type { LocationFilter } from "@/lib/graphql/generated/graphql";

export interface LocationFilters {
  name: string;
  type: string;
  dimension: string;
}

export const EMPTY_LOCATION_FILTERS: LocationFilters = {
  name: "",
  type: "",
  dimension: "",
};

export function parseLocationFiltersFromSearchParams(
  searchParams: URLSearchParams,
): LocationFilters {
  return {
    name: searchParams.get("name")?.trim() ?? "",
    type: searchParams.get("type")?.trim() ?? "",
    dimension: searchParams.get("dimension")?.trim() ?? "",
  };
}

/** Builds URL search params from filters, omitting empty values so the URL stays clean. */
export function buildLocationFiltersSearchParams(
  filters: Partial<LocationFilters>,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.name) params.set("name", filters.name);
  if (filters.type) params.set("type", filters.type);
  if (filters.dimension) params.set("dimension", filters.dimension);
  return params;
}

/** Maps our URL-shaped filters to the GraphQL filter input, omitting empty fields. */
export function toGraphQLLocationFilter(
  filters: LocationFilters,
): LocationFilter | undefined {
  const filter: LocationFilter = {};
  if (filters.name) filter.name = filters.name;
  if (filters.type) filter.type = filters.type;
  if (filters.dimension) filter.dimension = filters.dimension;
  return Object.keys(filter).length > 0 ? filter : undefined;
}

export function countActiveLocationFilters(filters: LocationFilters): number {
  return Object.values(filters).filter((value) => value !== "").length;
}
