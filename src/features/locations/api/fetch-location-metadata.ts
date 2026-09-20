import { UNKNOWN_VALUE } from "@/lib/normalize-text";

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ??
  "https://rickandmortyapi.com/graphql";

interface LocationMetadata {
  name: string;
  type: string;
}

interface RawMetadataResponse {
  data?: {
    location?: {
      name: string | null;
      type: string | null;
    } | null;
  };
}

/**
 * A minimal, standalone fetch for `generateMetadata` -- see
 * fetch-character-metadata.ts for why this doesn't go through Apollo.
 */
export async function fetchLocationMetadata(
  id: string,
): Promise<LocationMetadata | null> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query GetLocationMetadata($id: ID!) { location(id: $id) { name type } }`,
        variables: { id },
      }),
    });

    if (!response.ok) return null;

    const json = (await response.json()) as RawMetadataResponse;
    const location = json.data?.location;
    if (!location?.name) return null;

    return {
      name: location.name,
      type: location.type ?? UNKNOWN_VALUE,
    };
  } catch {
    return null;
  }
}
