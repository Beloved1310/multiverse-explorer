import type { FilterCharacter } from "@/lib/graphql/generated/graphql";

export interface CharacterFilters {
  name: string;
  status: string;
  species: string;
  gender: string;
}

export const EMPTY_CHARACTER_FILTERS: CharacterFilters = {
  name: "",
  status: "",
  species: "",
  gender: "",
};

// Verified against the live API: aggregated every character across all 42
// pages (826 characters total) and these are the only status/gender/species
// values that actually occur.
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

export const STATUS_LABELS: Record<
  (typeof CHARACTER_STATUS_OPTIONS)[number],
  string
> = {
  alive: "Alive",
  dead: "Dead",
  unknown: "Unknown",
};

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

/**
 * Reads filters from the URL. An unknown/invalid status, species or gender
 * value is silently ignored (falls back to "no filter") rather than
 * breaking the page or being sent to the API as-is.
 */
export function parseCharacterFiltersFromSearchParams(
  searchParams: URLSearchParams,
): CharacterFilters {
  return {
    name: searchParams.get("name")?.trim() ?? "",
    status: validateOption(
      searchParams.get("status"),
      CHARACTER_STATUS_OPTIONS,
    ),
    species: validateOption(
      searchParams.get("species"),
      CHARACTER_SPECIES_OPTIONS,
    ),
    gender: validateOption(
      searchParams.get("gender"),
      CHARACTER_GENDER_OPTIONS,
    ),
  };
}

/** Builds URL search params from filters, omitting empty values so the URL stays clean (no `?status=&species=`). */
export function buildCharacterFiltersSearchParams(
  filters: Partial<CharacterFilters>,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.name) params.set("name", filters.name);
  if (filters.status) params.set("status", filters.status);
  if (filters.species) params.set("species", filters.species);
  if (filters.gender) params.set("gender", filters.gender);
  return params;
}

/** Maps our URL-shaped filters to the GraphQL filter input, omitting empty fields rather than sending empty strings to the API. */
export function toGraphQLCharacterFilter(
  filters: CharacterFilters,
): FilterCharacter | undefined {
  const filter: FilterCharacter = {};
  if (filters.name) filter.name = filters.name;
  if (filters.status) filter.status = filters.status;
  if (filters.species) filter.species = filters.species;
  if (filters.gender) filter.gender = filters.gender;
  return Object.keys(filter).length > 0 ? filter : undefined;
}

export function countActiveFilters(filters: CharacterFilters): number {
  return Object.values(filters).filter((value) => value !== "").length;
}
