interface CharacterFixtureOverrides {
  id?: string;
  name?: string;
  status?: string;
  species?: string;
  location?: string;
}

function buildCharacterFixture(overrides: CharacterFixtureOverrides = {}) {
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

/** Shapes a `GetCharactersQuery` response the same way the real API does. */
export function buildCharactersResponse(
  characters: CharacterFixtureOverrides[] = [{}],
) {
  return {
    characters: {
      __typename: "Characters" as const,
      info: {
        __typename: "Info" as const,
        next: null,
        count: characters.length,
      },
      results: characters.map(buildCharacterFixture),
    },
  };
}
