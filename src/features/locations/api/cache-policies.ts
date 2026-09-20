import type {
  FieldMergeFunction,
  FieldReadFunction,
  Reference,
  TypePolicies,
} from "@apollo/client";
import type { GetLocationsQuery } from "@/lib/graphql/generated/graphql";

type LocationsFieldData = NonNullable<GetLocationsQuery["locations"]>;

// See character's cache-policies.ts for the full rationale.
const mergeLocations: FieldMergeFunction<LocationsFieldData> = (
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

const readLocationById: FieldReadFunction<Reference | null> = (
  existing,
  { args, toReference },
) => {
  if (existing !== undefined) return existing;
  const id = typeof args?.id === "string" ? args.id : undefined;
  return id ? toReference({ __typename: "Location", id }) : existing;
};

export const locationCacheTypePolicies: TypePolicies = {
  Query: {
    fields: {
      locations: {
        keyArgs: ["filter"],
        merge: mergeLocations,
      },
      location: {
        read: readLocationById,
      },
    },
  },
};
