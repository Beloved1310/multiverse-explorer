import type { FieldMergeFunction, TypePolicies } from "@apollo/client";
import type { GetCharactersQuery } from "@/lib/graphql/generated/graphql";

type CharactersFieldData = NonNullable<GetCharactersQuery["characters"]>;

/**
 * `keyArgs: ["filter"]` deliberately excludes `page`: every page fetched
 * for the same filter should merge into one growing list (that's what
 * `merge` does below), but a different filter must get its own cache
 * entry entirely. Without `filter` in keyArgs, switching filters would
 * append the new filter's page 1 onto the old filter's already-loaded
 * pages instead of starting a fresh list; with `page` in keyArgs instead
 * (the default), every page would get its own separate entry and never
 * merge into one growing list, and returning to a previous filter
 * wouldn't read its already-loaded pages back from cache.
 */
const mergeCharacters: FieldMergeFunction<CharactersFieldData> = (
  existing,
  incoming,
  { args },
) => {
  const page = typeof args?.page === "number" ? args.page : 1;

  // Page 1 (a fresh filter, or a retry/refetch) replaces outright rather
  // than appending -- otherwise a retry would duplicate the first page.
  if (!existing || page <= 1) {
    return incoming;
  }

  return {
    ...incoming, // keep the latest `info` (next/count), not a merged one
    results: [...(existing.results ?? []), ...(incoming.results ?? [])],
  };
};

export const characterCacheTypePolicies: TypePolicies = {
  Query: {
    fields: {
      characters: {
        keyArgs: ["filter"],
        merge: mergeCharacters,
      },
    },
  },
};
