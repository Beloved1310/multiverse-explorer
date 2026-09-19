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
import { characterCacheTypePolicies } from "@/features/characters/api/cache-policies";
import { isRetryableNetworkError } from "./retry-condition";

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ??
  "https://rickandmortyapi.com/graphql";

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

function makeClient() {
  const httpLink = new HttpLink({ uri: GRAPHQL_ENDPOINT });

  return new ApolloClient({
    cache: new InMemoryCache({ typePolicies: characterCacheTypePolicies }),
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
