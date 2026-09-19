import type {
  FieldMergeFunction,
  FieldReadFunction,
  Reference,
  TypePolicies,
} from "@apollo/client";
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

/**
 * Every `Character` object Apollo has ever seen -- from the list, from a
 * previous visit to this same detail page -- is already normalized into
 * its own `Character:<id>` cache entity (any object with `__typename` +
 * `id` gets this automatically). By default, though, the root
 * `Query.character(id)` field has no way of knowing it should point at
 * that entity until a network response for *this exact query* has come
 * back once. This `read` redirects it there immediately: `toReference`
 * resolves to the existing entity without a network round trip, so
 * whatever fields the list query already fetched (name, image, status)
 * render at once, while `returnPartialData` (set on the query itself)
 * lets the rest of the page keep rendering around the fields that
 * haven't arrived yet (e.g. episodes) instead of blocking on them.
 */
const readCharacterById: FieldReadFunction<Reference | null> = (
  existing,
  { args, toReference },
) => {
  // `existing === null` is a *confirmed* result (a previous network
  // response already said "no such character") and must be returned
  // as-is -- checking plain truthiness would treat that null the same
  // as "never fetched" and redirect forever, so a nonexistent id could
  // never actually resolve to the not-found state.
  if (existing !== undefined) return existing;
  const id = typeof args?.id === "string" ? args.id : undefined;
  return id ? toReference({ __typename: "Character", id }) : existing;
};

export const characterCacheTypePolicies: TypePolicies = {
  Query: {
    fields: {
      characters: {
        keyArgs: ["filter"],
        merge: mergeCharacters,
      },
      character: {
        read: readCharacterById,
      },
    },
  },
};
