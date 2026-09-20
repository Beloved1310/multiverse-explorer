export interface CharacterFixtureOverrides {
  id?: string;
  name?: string;
  status?: string;
  species?: string;
  location?: string;
}

/** Shapes a single `Character` result the same way the real API does -- reused wherever a query embeds character fields (the list, comparisons, curated collections). */
export function buildCharacterFixture(
  overrides: CharacterFixtureOverrides = {},
) {
  return {
    __typename: "Character" as const,
    id: overrides.id ?? "1",
    name: overrides.name ?? "Rick Sanchez",
    image: `https://rickandmortyapi.com/api/character/avatar/${overrides.id ?? "1"}.jpeg`,
    status: overrides.status ?? "Alive",
    species: overrides.species ?? "Human",
    gender: "Male",
    origin: { __typename: "Location" as const, name: "Earth (C-137)" },
    location: {
      __typename: "Location" as const,
      name: overrides.location ?? "Citadel of Ricks",
    },
    episode: [{ __typename: "Episode" as const, name: "Pilot" }],
  };
}

interface CharactersResponseOptions {
  /** The next page number, or null on the last page. Defaults to null (a single, complete page). */
  next?: number | null;
  /** Total count across all pages. Defaults to the number of results given. */
  count?: number;
}

/** Shapes a `GetCharactersQuery` response the same way the real API does. */
export function buildCharactersResponse(
  characters: CharacterFixtureOverrides[] = [{}],
  { next = null, count }: CharactersResponseOptions = {},
) {
  return {
    characters: {
      __typename: "Characters" as const,
      info: {
        __typename: "Info" as const,
        next,
        count: count ?? characters.length,
      },
      results: characters.map(buildCharacterFixture),
    },
  };
}
