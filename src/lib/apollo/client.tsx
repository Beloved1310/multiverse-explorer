"use client";

import { ApolloLink, HttpLink } from "@apollo/client";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ErrorLink } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import type { TypePolicies } from "@apollo/client";
import { characterCacheTypePolicies } from "@/features/characters/api/cache-policies";
import { episodeCacheTypePolicies } from "@/features/episodes/api/cache-policies";
import { locationCacheTypePolicies } from "@/features/locations/api/cache-policies";
import { isRetryableNetworkError } from "./retry-condition";

// Browser requests must always pass through the BFF. The upstream public API
// is intentionally a server-only concern, configured in the data loader.
const GRAPHQL_ENDPOINT = "/api/graphql";

const errorLink = new ErrorLink(({ error, operation }) => {
  if (process.env.NODE_ENV !== "development") return;

  const errorType = CombinedGraphQLErrors.is(error)
    ? "GraphQL error"
    : "Network error";

  console.error(`[${errorType}] ${operation.operationName}`, {
    variables: operation.variables,
    error,
  });
});

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: isRetryableNetworkError,
  },
});

// Each feature's policies only ever touch their own Query fields
// (characters/character, episodes/episode, locations/location), so merging
// their `Query.fields` objects is safe -- no feature can clobber another's.
const typePolicies: TypePolicies = {
  Query: {
    fields: {
      ...characterCacheTypePolicies.Query?.fields,
      ...episodeCacheTypePolicies.Query?.fields,
      ...locationCacheTypePolicies.Query?.fields,
    },
  },
};

function makeClient() {
  const httpLink = new HttpLink({ uri: GRAPHQL_ENDPOINT });

  return new ApolloClient({
    cache: new InMemoryCache({ typePolicies }),
    link: ApolloLink.from([errorLink, retryLink, httpLink]),
  });
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
