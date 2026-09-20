import type { ConnectedCharacter } from "@/server/data/types";
import { filterCharacters, type CharacterFilterInput } from "./query-utils";

export type RecoveryStep =
  "NAME" | "STATUS" | "SPECIES" | "DIMENSION" | "MIN_EPISODES";

export interface SearchRecoveryOption {
  label: string;
  value: string;
  count: number;
  filter: CharacterFilterInput;
}

export interface SearchRecoveryResult {
  step: RecoveryStep;
  question: string;
  options: SearchRecoveryOption[];
}

const MAX_OPTIONS = 6;

function without<T extends keyof CharacterFilterInput>(
  filter: CharacterFilterInput,
  key: T,
): CharacterFilterInput {
  const next = { ...filter };
  delete next[key];
  return next;
}

function groupedOptions(
  characters: ConnectedCharacter[],
  field: "status" | "species" | "dimension",
  baseFilter: CharacterFilterInput,
): SearchRecoveryOption[] {
  const groups = new Map<string, number>();
  for (const character of characters) {
    const value =
      field === "status"
        ? character.status
        : field === "species"
          ? character.species
          : (character.location?.dimension ??
            character.origin?.dimension ??
            "Unknown");
    groups.set(value, (groups.get(value) ?? 0) + 1);
  }

  return [...groups.entries()]
    .sort(
      ([firstValue, firstCount], [secondValue, secondCount]) =>
        secondCount - firstCount || firstValue.localeCompare(secondValue),
    )
    .slice(0, MAX_OPTIONS)
    .map(([value, count]) => ({
      label: value,
      value,
      count,
      filter:
        field === "status"
          ? { ...baseFilter, statuses: [value] }
          : { ...baseFilter, [field]: value },
    }));
}

function levenshtein(first: string, second: string): number {
  const previous = Array.from(
    { length: second.length + 1 },
    (_, index) => index,
  );
  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    let diagonal = previous[0]!;
    previous[0] = firstIndex;
    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      const above = previous[secondIndex]!;
      previous[secondIndex] = Math.min(
        previous[secondIndex]! + 1,
        previous[secondIndex - 1]! + 1,
        diagonal + Number(first[firstIndex - 1] !== second[secondIndex - 1]),
      );
      diagonal = above;
    }
  }
  return previous[second.length]!;
}

function nameOptions(
  characters: ConnectedCharacter[],
  filter: CharacterFilterInput,
): SearchRecoveryOption[] {
  const query = filter.name?.trim().toLocaleLowerCase();
  if (!query || query.length < 2) return [];

  const baseFilter = without(filter, "name");
  const candidates = filterCharacters(characters, baseFilter)
    .map((character) => ({
      character,
      distance: levenshtein(query, character.name.toLocaleLowerCase()),
    }))
    .filter(
      ({ distance, character }) =>
        character.name.toLocaleLowerCase().includes(query) ||
        distance <= Math.max(2, Math.floor(query.length / 3)),
    )
    .sort(
      (first, second) =>
        first.distance - second.distance ||
        first.character.name.localeCompare(second.character.name),
    )
    .slice(0, MAX_OPTIONS);

  return candidates.map(({ character }) => ({
    label: character.name,
    value: character.name,
    count: 1,
    filter: { ...baseFilter, name: character.name },
  }));
}

/**
 * Returns one server-selected next question. Every option is derived from the
 * connected dataset and would produce results when applied.
 */
export function createSearchRecovery(
  characters: ConnectedCharacter[],
  filter: CharacterFilterInput = {},
): SearchRecoveryResult | null {
  if (filterCharacters(characters, filter).length > 0) return null;

  const names = nameOptions(characters, filter);
  if (names.length > 0) {
    return {
      step: "NAME",
      question: "Could the name be one of these?",
      options: names,
    };
  }

  if (filter.statuses?.length) {
    const baseFilter = without(filter, "statuses");
    const options = groupedOptions(
      filterCharacters(characters, baseFilter),
      "status",
      baseFilter,
    );
    if (options.length) {
      return {
        step: "STATUS",
        question: "Do you remember their status?",
        options,
      };
    }
  }

  if (filter.species) {
    const baseFilter = without(filter, "species");
    const options = groupedOptions(
      filterCharacters(characters, baseFilter),
      "species",
      baseFilter,
    );
    if (options.length) {
      return {
        step: "SPECIES",
        question: "What kind of being were they?",
        options,
      };
    }
  }

  if (filter.dimension) {
    const baseFilter = without(filter, "dimension");
    const options = groupedOptions(
      filterCharacters(characters, baseFilter),
      "dimension",
      baseFilter,
    );
    if (options.length) {
      return {
        step: "DIMENSION",
        question: "Could they be from another dimension?",
        options,
      };
    }
  }

  if (filter.minEpisodes && filter.minEpisodes > 0) {
    const baseFilter = without(filter, "minEpisodes");
    const count = filterCharacters(characters, baseFilter).length;
    if (count > 0) {
      return {
        step: "MIN_EPISODES",
        question: "Could they have appeared in fewer episodes?",
        options: [
          {
            label: "Any episode count",
            value: "0",
            count,
            filter: baseFilter,
          },
        ],
      };
    }
  }

  return null;
}
