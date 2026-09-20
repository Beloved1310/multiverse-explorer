import { UNKNOWN_VALUE } from "@/lib/normalize-text";

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ??
  "https://rickandmortyapi.com/graphql";

interface EpisodeMetadata {
  name: string;
  code: string;
}

interface RawMetadataResponse {
  data?: {
    episode?: {
      name: string | null;
      episode: string | null;
    } | null;
  };
}

/**
 * A minimal, standalone fetch for `generateMetadata` -- see
 * fetch-character-metadata.ts for why this doesn't go through Apollo.
 */
export async function fetchEpisodeMetadata(
  id: string,
): Promise<EpisodeMetadata | null> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query GetEpisodeMetadata($id: ID!) { episode(id: $id) { name episode } }`,
        variables: { id },
      }),
    });

    if (!response.ok) return null;

    const json = (await response.json()) as RawMetadataResponse;
    const episode = json.data?.episode;
    if (!episode?.name) return null;

    return {
      name: episode.name,
      code: episode.episode ?? UNKNOWN_VALUE,
    };
  } catch {
    return null;
  }
}
