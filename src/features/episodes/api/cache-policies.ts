import type {
  FieldMergeFunction,
  FieldReadFunction,
  Reference,
  TypePolicies,
} from "@apollo/client";
import type { GetEpisodesQuery } from "@/lib/graphql/generated/graphql";

type EpisodesFieldData = NonNullable<GetEpisodesQuery["episodes"]>;

// See character's cache-policies.ts for the full rationale -- same shape:
// `keyArgs: ["filter"]` so each filter gets its own growing list instead of
// pages from different filters getting appended together.
const mergeEpisodes: FieldMergeFunction<EpisodesFieldData> = (
  existing,
  incoming,
  { args },
) => {
  const page = typeof args?.page === "number" ? args.page : 1;

  if (!existing || page <= 1) {
    return incoming;
  }

  return {
    ...incoming,
    results: [...(existing.results ?? []), ...(incoming.results ?? [])],
  };
};

const readEpisodeById: FieldReadFunction<Reference | null> = (
  existing,
  { args, toReference },
) => {
  if (existing !== undefined) return existing;
  const id = typeof args?.id === "string" ? args.id : undefined;
  return id ? toReference({ __typename: "Episode", id }) : existing;
};

export const episodeCacheTypePolicies: TypePolicies = {
  Query: {
    fields: {
      episodes: {
        keyArgs: ["filter"],
        merge: mergeEpisodes,
      },
      episode: {
        read: readEpisodeById,
      },
    },
  },
};
