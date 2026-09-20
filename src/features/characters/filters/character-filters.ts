import type {
  CharacterFilter,
  CharacterSort,
} from "@/lib/graphql/generated/graphql";
import { STATUS_LABELS } from "../domain/character";

export { STATUS_LABELS };

export type CharacterSortValue =
  "name-asc" | "name-desc" | "episodes-desc" | "episodes-asc";

export interface CharacterFilters {
  name: string;
  statuses: string[];
  species: string;
  gender: string;
  dimension: string;
  minEpisodes: string;
  sort: CharacterSortValue;
}

export const EMPTY_CHARACTER_FILTERS: CharacterFilters = {
  name: "",
  statuses: [],
  species: "",
  gender: "",
  dimension: "",
  minEpisodes: "",
  sort: "name-asc",
};

export const CHARACTER_STATUS_OPTIONS = ["alive", "dead", "unknown"] as const;
export const CHARACTER_GENDER_OPTIONS = [
  "male",
  "female",
  "genderless",
  "unknown",
] as const;
export const CHARACTER_SPECIES_OPTIONS = [
  "Human",
  "Alien",
  "Humanoid",
  "Animal",
  "Robot",
  "Mythological Creature",
  "Cronenberg",
  "Poopybutthole",
  "Disease",
  "unknown",
] as const;

export const GENDER_LABELS: Record<
  (typeof CHARACTER_GENDER_OPTIONS)[number],
  string
> = {
  male: "Male",
  female: "Female",
  genderless: "Genderless",
  unknown: "Unknown",
};

function validateOption<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T | "" {
  if (!value) return "";
  const match = allowed.find(
    (option) => option.toLowerCase() === value.toLowerCase(),
  );
  return match ?? "";
}

function parseStatuses(searchParams: URLSearchParams): string[] {
  return [
    ...new Set(
      searchParams
        .getAll("status")
        .map((status) => validateOption(status, CHARACTER_STATUS_OPTIONS))
        .filter(Boolean),
    ),
  ];
}

function parseMinimumEpisodes(value: string | null): string {
  if (!value || !/^\d+$/.test(value)) return "";
  return value;
}

function parseSort(value: string | null): CharacterSortValue {
  const options: CharacterSortValue[] = [
    "name-asc",
    "name-desc",
    "episodes-desc",
    "episodes-asc",
  ];
  return options.includes(value as CharacterSortValue)
    ? (value as CharacterSortValue)
    : "name-asc";
}

export function parseCharacterFiltersFromSearchParams(
  searchParams: URLSearchParams,
): CharacterFilters {
  return {
    name: searchParams.get("name")?.trim() ?? "",
    statuses: parseStatuses(searchParams),
    species: validateOption(
      searchParams.get("species"),
      CHARACTER_SPECIES_OPTIONS,
    ),
    gender: validateOption(
      searchParams.get("gender"),
      CHARACTER_GENDER_OPTIONS,
    ),
    dimension: searchParams.get("dimension")?.trim() ?? "",
    minEpisodes: parseMinimumEpisodes(searchParams.get("minEpisodes")),
    sort: parseSort(searchParams.get("sort")),
  };
}

export function buildCharacterFiltersSearchParams(
  filters: Partial<CharacterFilters>,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.name) params.set("name", filters.name);
  filters.statuses?.forEach((status) => params.append("status", status));
  if (filters.species) params.set("species", filters.species);
  if (filters.gender) params.set("gender", filters.gender);
  if (filters.dimension) params.set("dimension", filters.dimension);
  if (filters.minEpisodes) params.set("minEpisodes", filters.minEpisodes);
  if (filters.sort && filters.sort !== "name-asc")
    params.set("sort", filters.sort);
  return params;
}

export function toGraphQLCharacterFilter(
  filters: CharacterFilters,
): CharacterFilter | undefined {
  const filter: CharacterFilter = {};
  if (filters.name) filter.name = filters.name;
  if (filters.statuses.length) filter.statuses = filters.statuses;
  if (filters.species) filter.species = filters.species;
  if (filters.gender) filter.gender = filters.gender;
  if (filters.dimension) filter.dimension = filters.dimension;
  if (filters.minEpisodes) filter.minEpisodes = Number(filters.minEpisodes);
  return Object.keys(filter).length > 0 ? filter : undefined;
}

export function toGraphQLCharacterSort(
  sort: CharacterSortValue,
): CharacterSort {
  const [field, direction] = sort.split("-");
  return {
    field: field === "episodes" ? "EPISODE_COUNT" : "NAME",
    direction: direction === "desc" ? "DESC" : "ASC",
  };
}

export function countActiveFilters(filters: CharacterFilters): number {
  return [
    filters.name,
    filters.statuses.length > 0,
    filters.species,
    filters.gender,
    filters.dimension,
    filters.minEpisodes,
  ].filter(Boolean).length;
}
