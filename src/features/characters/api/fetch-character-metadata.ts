import { UNKNOWN_VALUE } from "@/lib/normalize-text";

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ??
  "https://rickandmortyapi.com/graphql";

interface CharacterMetadata {
  name: string;
  status: string;
  species: string;
}

interface RawMetadataResponse {
  data?: {
    character?: {
      name: string | null;
      status: string | null;
      species: string | null;
    } | null;
  };
}

/**
 * A minimal, standalone fetch for `generateMetadata` -- runs on the
 * server before the page's own client-side Apollo query does, so it
 * deliberately doesn't go through Apollo at all (that setup is oriented
 * around the browser via ApolloNextAppProvider). Returns null for any
 * failure or a nonexistent id; the page falls back to a generic title.
 */
export async function fetchCharacterMetadata(
  id: string,
): Promise<CharacterMetadata | null> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query GetCharacterMetadata($id: ID!) { character(id: $id) { name status species } }`,
        variables: { id },
      }),
    });

    if (!response.ok) return null;

    const json = (await response.json()) as RawMetadataResponse;
    const character = json.data?.character;
    if (!character?.name) return null;

    return {
      name: character.name,
      status: character.status ?? UNKNOWN_VALUE,
      species: character.species ?? UNKNOWN_VALUE,
    };
  } catch {
    return null;
  }
}
