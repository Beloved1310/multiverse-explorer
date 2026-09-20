interface EpisodeFixtureOverrides {
  id?: string;
  name?: string;
  episode?: string;
  air_date?: string;
  characterCount?: number;
}

function buildEpisodeFixture(overrides: EpisodeFixtureOverrides = {}) {
  const characterCount = overrides.characterCount ?? 1;
  return {
    __typename: "Episode" as const,
    id: overrides.id ?? "1",
    name: overrides.name ?? "Pilot",
    episode: overrides.episode ?? "S01E01",
    air_date: overrides.air_date ?? "December 2, 2013",
    characters: Array.from({ length: characterCount }, (_, index) => ({
      __typename: "Character" as const,
      id: String(index + 1),
    })),
  };
}

interface EpisodesResponseOptions {
  next?: number | null;
  count?: number;
}

/** Shapes a `GetEpisodesQuery` response the same way the real API does. */
export function buildEpisodesResponse(
  episodes: EpisodeFixtureOverrides[] = [{}],
  { next = null, count }: EpisodesResponseOptions = {},
) {
  return {
    episodes: {
      __typename: "Episodes" as const,
      info: {
        __typename: "Info" as const,
        next,
        count: count ?? episodes.length,
      },
      results: episodes.map(buildEpisodeFixture),
    },
  };
}
